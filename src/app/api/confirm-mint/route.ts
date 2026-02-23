import { NextRequest, NextResponse } from "next/server";
import { getTicketById, markTicketAsClaimed } from "@/lib/mock-tickets";
import { generateArtwork } from "@/lib/artwork";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId } = body as { ticketId?: string };

    if (!ticketId) {
      return NextResponse.json(
        { error: "Missing ticketId" },
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

    // Mark ticket as claimed after user successfully signed and sent transaction
    markTicketAsClaimed(ticketId);

    // Generate artwork for response
    const artworkSvg = generateArtwork(ticket);

    return NextResponse.json({
      success: true,
      message: "Ticket claimed successfully",
      ticket: {
        ticketId: ticket.ticketId,
        eventName: ticket.eventName,
        artist: ticket.artist,
        venue: ticket.venue,
        city: ticket.city,
        date: ticket.date,
        artworkSvg,
        claimed: true,
        claimedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("confirm-mint error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error confirming mint" },
      { status: 500 }
    );
  }
}
