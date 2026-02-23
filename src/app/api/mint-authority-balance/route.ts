import { NextResponse } from "next/server";
import { Connection, Keypair } from "@solana/web3.js";

export async function GET() {
  try {
    const secret = process.env.MINT_AUTHORITY_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { error: "MINT_AUTHORITY_SECRET_KEY not set" },
        { status: 400 }
      );
    }

    let arr: number[];
    try {
      arr = JSON.parse(secret) as number[];
    } catch (e) {
      return NextResponse.json(
        { error: "MINT_AUTHORITY_SECRET_KEY malformed" },
        { status: 400 }
      );
    }

    if (!Array.isArray(arr) || arr.length !== 64) {
      return NextResponse.json(
        { error: "MINT_AUTHORITY_SECRET_KEY invalid format" },
        { status: 400 }
      );
    }

    const kp = Keypair.fromSecretKey(Uint8Array.from(arr));
    const pub = kp.publicKey.toBase58();

    const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
    const conn = new Connection(rpc);
    const lamports = await conn.getBalance(kp.publicKey);

    return NextResponse.json({ publicKey: pub, lamports, sol: lamports / 1e9 });
  } catch (err) {
    console.error("mint-authority-balance error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
