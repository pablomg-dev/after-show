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
      // createUmiDefaults takes the RPC endpoint as the first parameter
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

/**
 * Build a transaction to mint an NFT.
 * 
 * This function constructs but does NOT send the transaction.
 * The server signs only as updateAuthority (MINT_AUTHORITY).
 * The user (via Phantom) is the feePayer and signs to approve.
 * 
 * Returns: Transaction serialized to base64 (partially signed by server)
 */
export async function buildMintTransaction(
  params: MintAftershowParams
): Promise<string> {
  const umi = getUmiInstance();
  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com"
  );

  // ========================================
  // ROLE DEFINITIONS
  // ========================================
  // MINT_AUTHORITY: server-side keypair (from MINT_AUTHORITY_SECRET_KEY)
  // - Signs as updateAuthority
  // - Signs as mint authority
  // - Does NOT pay fees
  const mintAuthority = umi.identity;
  const mintAuthorityPubkey = new PublicKey(mintAuthority.publicKey.toString());

  // USER WALLET: from request (Phantom wallet)
  // - Is the feePayer (pays all transaction costs)
  // - Is the tokenOwner (receives the NFT)
  const userWallet = new PublicKey(params.ownerWallet);

  // ========================================
  // STEP 1: BUILD INSTRUCTIONS AND GET SERIALIZABLE DATA
  // ========================================
  // Use UMI to construct the instructions, then extract the serializable data
  const mint = generateSigner(umi);
  const mintPubkey = new PublicKey(mint.publicKey.toString());
  // Truncate name to 32 chars (Solana Token Metadata limit)
  const name = `Aftershow: ${params.ticket.eventName}`.slice(0, 32);

  // Get instructions from UMI builders
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

  // ========================================
  // STEP 2: CONVERT UMI INSTRUCTIONS TO WEB3.JS FORMAT
  // ========================================
  const convertedInstructions = [
    ...createInstructions.map(convertUmiToWeb3Instruction),
    ...mintInstructions.map(convertUmiToWeb3Instruction),
  ];

  // ========================================
  // STEP 3: BUILD VERSIONED TRANSACTION
  // ========================================
  const latestBlockhash = await connection.getLatestBlockhash();

  const txMessage = new TransactionMessage({
    payerKey: userWallet, // USER PAYS FEES
    recentBlockhash: latestBlockhash.blockhash,
    instructions: convertedInstructions,
  });

  const tx = new VersionedTransaction(txMessage.compileToV0Message());

  // ========================================
  // STEP 4: PARTIAL SIGN WITH MINT_AUTHORITY AND MINT
  // ========================================
  // Get keypairs from UMI
  const mintAuthorityKeypair = Keypair.fromSecretKey(
    new Uint8Array((mintAuthority as any).secretKey)
  );

  const mintKeypair = Keypair.fromSecretKey(
    new Uint8Array((mint as any).secretKey)
  );

  // Sign with both authorities (server side)
  tx.sign([mintAuthorityKeypair, mintKeypair]);

  // ========================================
  // STEP 5: SERIALIZE AND RETURN
  // ========================================
  const txBuffer = tx.serialize();
  const txBase64 = Buffer.from(txBuffer).toString("base64");

  return txBase64;
}

/**
 * Convert a UMI Instruction to a web3.js TransactionInstruction
 */
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
      let artist = "";
      let venue = "";
      let city = "";
      let date = "";
      let eventName = "";
      let ticketId = "";

      // Fetch metadata from the API endpoint
      if (uri && uri.length > 0) {
        try {
          const metadataResponse = await fetch(uri);
          if (metadataResponse.ok) {
            const json = (await metadataResponse.json()) as {
              name?: string;
              attributes?: Array<{ trait_type: string; value: string }>;
            };
            const attrs = json.attributes ?? [];
            for (const a of attrs) {
              if (a.trait_type === "Artist") artist = a.value;
              if (a.trait_type === "Venue") venue = a.value;
              if (a.trait_type === "City") city = a.value;
              if (a.trait_type === "Date") date = a.value;
              if (a.trait_type === "Ticket ID") ticketId = a.value;
            }
            eventName = (json.name as string)?.replace(/^Aftershow: /, "") ?? "";
          }
        } catch (_) {
          // URI fetch failed, skip this NFT
          continue;
        }
      }

      // Regenerate artwork from ticket data (deterministic)
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
