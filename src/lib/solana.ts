import {
  createUmi,
  generateSigner,
  keypairIdentity,
  publicKey as umiPublicKey,
  percentAmount,
} from "@metaplex-foundation/umi";
import { createUmi as createUmiDefaults } from "@metaplex-foundation/umi-bundle-defaults";
import {
  mplTokenMetadata,
  createV1,
  mintV1,
  TokenStandard,
  fetchDigitalAsset,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  Connection,
  PublicKey,
  VersionedTransaction,
  TransactionMessage,
  Keypair,
  TransactionInstruction,
} from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { generateArtwork } from "./artwork";
import type { EventTicket } from "./types";
import type { AfterShowNFT } from "./types";

const getUmi = (() => {
  let umi: ReturnType<typeof createUmiDefaults> | null = null;
  return () => {
    if (!umi) {
      const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
      umi = createUmiDefaults(rpc).use(mplTokenMetadata());
      const secret = process.env.MINT_AUTHORITY_SECRET_KEY;
      if (secret) {
        try {
          const arr = JSON.parse(secret) as number[];
          if (Array.isArray(arr) && arr.length === 64) {
            const keypair = umi.eddsa.createKeypairFromSecretKey(Uint8Array.from(arr));
            umi = umi.use(keypairIdentity(keypair));
          }
        } catch (_) {
          console.warn("MINT_AUTHORITY_SECRET_KEY invalid, mint will fail until set.");
        }
      }
    }
    return umi;
  };
})();

export function getUmiInstance() {
  return getUmi();
}

export interface MintAftershowParams {
  ticket: EventTicket;
  metadataUri: string;
  ownerWallet: string;
}

export async function buildMintTransaction(
  params: MintAftershowParams
): Promise<string> {
  const umi = getUmiInstance();
  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com"
  );

  const mintAuthority = umi.identity;
  const userWallet = new PublicKey(params.ownerWallet);

  const mint = generateSigner(umi);
  const mintPubkey = new PublicKey(mint.publicKey.toString());
  const name = `Aftershow: ${params.ticket.eventName}`.slice(0, 32);

  const createInstructions = await createV1(umi, {
    mint,
    authority: mintAuthority,
    name,
    symbol: "AFTER",
    uri: params.metadataUri,
    sellerFeeBasisPoints: percentAmount(0),
    tokenStandard: TokenStandard.NonFungible,
  }).getInstructions();

  const userTokenAccount = getAssociatedTokenAddressSync(mintPubkey, userWallet);
  const tokenAccountPubkey = umiPublicKey(userTokenAccount.toString());

  const mintInstructions = await mintV1(umi, {
    mint: mint.publicKey,
    authority: mintAuthority,
    amount: 1,
    tokenOwner: umiPublicKey(params.ownerWallet),
    token: tokenAccountPubkey,
    tokenStandard: TokenStandard.NonFungible,
  }).getInstructions();

  const convertedInstructions = [
    ...createInstructions.map(convertUmiToWeb3Instruction),
    ...mintInstructions.map(convertUmiToWeb3Instruction),
  ];

  const latestBlockhash = await connection.getLatestBlockhash();

  const txMessage = new TransactionMessage({
    payerKey: userWallet,
    recentBlockhash: latestBlockhash.blockhash,
    instructions: convertedInstructions,
  });

  const tx = new VersionedTransaction(txMessage.compileToV0Message());

  const mintAuthorityKeypair = Keypair.fromSecretKey(
    new Uint8Array((mintAuthority as any).secretKey)
  );
  const mintKeypair = Keypair.fromSecretKey(
    new Uint8Array((mint as any).secretKey)
  );

  tx.sign([mintAuthorityKeypair, mintKeypair]);

  const txBuffer = tx.serialize();
  return Buffer.from(txBuffer).toString("base64");
}

function convertUmiToWeb3Instruction(umiInstruction: any): TransactionInstruction {
  return new TransactionInstruction({
    programId: new PublicKey(umiInstruction.programId.toString()),
    keys: umiInstruction.keys.map((key: any) => ({
      pubkey: new PublicKey(key.pubkey.toString()),
      isSigner: key.isSigner,
      isWritable: key.isWritable,
    })),
    data: Buffer.from(umiInstruction.data),
  });
}

function parseMetadataJson(json: {
  name?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}) {
  let artist = "";
  let venue = "";
  let city = "";
  let date = "";
  let ticketId = "";

  const attrs = json.attributes ?? [];
  for (const a of attrs) {
    if (a.trait_type === "Artist") artist = a.value;
    if (a.trait_type === "Venue") venue = a.value;
    if (a.trait_type === "City") city = a.value;
    if (a.trait_type === "Date") date = a.value;
    if (a.trait_type === "Ticket ID") ticketId = a.value;
  }

  const eventName = (json.name as string)?.replace(/^Aftershow: /, "") ?? "";

  return { artist, venue, city, date, ticketId, eventName };
}

export async function fetchAftershowNftsByOwner(ownerWallet: string): Promise<AfterShowNFT[]> {
  const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
  const connection = new Connection(rpc);
  const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
  const owner = new PublicKey(ownerWallet);

  const accounts = await connection.getParsedTokenAccountsByOwner(owner, {
    programId: TOKEN_PROGRAM_ID,
  });

  const nftMints: string[] = [];
  for (const { account } of accounts.value) {
    const amount = account.data.parsed.info.tokenAmount;
    if (amount.decimals === 0 && amount.amount === "1") {
      nftMints.push(account.data.parsed.info.mint);
    }
  }

  const umi = getUmiInstance();
  const results: AfterShowNFT[] = [];

  for (const mintStr of nftMints) {
    try {
      const asset = await fetchDigitalAsset(umi, umiPublicKey(mintStr));
      const symbol = asset.metadata.symbol?.replace(/\0/g, "").trim();
      if (symbol !== "AFTER") continue;

      const uri = asset.metadata.uri?.replace(/\0/g, "").trim() ?? "";
      let parsed: ReturnType<typeof parseMetadataJson> | null = null;

      // Handle data URI (base64 encoded JSON — most common case)
      if (uri.startsWith("data:application/json;base64,")) {
        try {
          const base64 = uri.replace("data:application/json;base64,", "");
          const json = JSON.parse(
            Buffer.from(base64, "base64").toString("utf-8")
          ) as {
            name?: string;
            attributes?: Array<{ trait_type: string; value: string }>;
          };
          parsed = parseMetadataJson(json);
        } catch (_) {
          continue;
        }
      // Handle regular HTTP/HTTPS URI (fallback for future integrations)
      } else if (uri.startsWith("http")) {
        try {
          const metadataResponse = await fetch(uri);
          if (metadataResponse.ok) {
            const json = (await metadataResponse.json()) as {
              name?: string;
              attributes?: Array<{ trait_type: string; value: string }>;
            };
            parsed = parseMetadataJson(json);
          } else {
            continue;
          }
        } catch (_) {
          continue;
        }
      } else {
        // Unknown URI format, skip
        continue;
      }

      if (!parsed) continue;

      const { artist, venue, city, date, ticketId, eventName } = parsed;

      const reconstructedTicket: EventTicket = {
        ticketId,
        eventName,
        artist,
        venue,
        city,
        date,
        claimed: true,
        verified: true,
      };

      const artworkSvg = generateArtwork(reconstructedTicket);

      results.push({
        mintAddress: mintStr,
        ticketId,
        eventName,
        artist,
        venue,
        city,
        date,
        artworkSvg,
        claimedAt: "",
        ownerWallet,
      });
    } catch (_) {
      // skip invalid or non-Aftershow NFTs
    }
  }

  return results;
}