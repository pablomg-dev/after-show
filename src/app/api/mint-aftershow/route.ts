import { NextRequest, NextResponse } from "next/server";
import { getTicketById } from "@/lib/mock-tickets";
import { generateArtwork } from "@/lib/artwork";
import { buildMintTransaction } from "@/lib/solana";

function buildMetadataJsonUri(ticket: { ticketId: string }, baseUrl: string): string {
  // Use a short URL pointing to the metadata API endpoint
  return `${baseUrl}/api/metadata/${ticket.ticketId}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, walletAddress } = body as { ticketId?: string; walletAddress?: string };

    if (!ticketId || !walletAddress) {
      return NextResponse.json(
        { error: "Missing ticketId or walletAddress" },
        { status: 400 }
      );
    }

    const ticket = getTicketById(ticketId);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
    if (ticket.claimed) {
      return NextResponse.json(
        { error: "This ticket has already been claimed" },
        { status: 400 }
      );
    }
    if (!ticket.verified) {
      return NextResponse.json(
        { error: "Ticket not verified" },
        { status: 400 }
      );
    }

    // Build base URL from request headers
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const artworkSvg = generateArtwork(ticket);
    const metadataUri = buildMetadataJsonUri(ticket, baseUrl);

    // Build transaction (partially signed by server, user will complete the signature)
    const transactionBase64 = await buildMintTransaction({
      ticket,
      metadataUri,
      ownerWallet: walletAddress,
    });

    return NextResponse.json({
      success: true,
      transaction: transactionBase64,
      message: "Transaction built successfully. Sign with Phantom to complete minting.",
    });
  } catch (err) {
    console.error("mint-aftershow error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error building mint transaction" },
      { status: 500 }
    );
  }
}
