import { NextRequest, NextResponse } from "next/server";
import { fetchAftershowNftsByOwner } from "@/lib/solana";

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ error: "Falta wallet" }, { status: 400 });
  }

  try {
    const nfts = await fetchAftershowNftsByOwner(wallet);
    return NextResponse.json({ nfts });
  } catch (err) {
    console.error("nfts-by-owner error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al cargar NFTs" },
      { status: 500 }
    );
  }
}
