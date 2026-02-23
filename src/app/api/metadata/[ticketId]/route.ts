import { NextRequest, NextResponse } from "next/server";
import { getTicketById } from "@/lib/mock-tickets";

interface Params {
  ticketId: string;
}

export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const { ticketId } = params;

    const ticket = getTicketById(ticketId);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const metadata = {
      name: `Aftershow: ${ticket.eventName}`,
      symbol: "AFTER",
      description: `Verifiable proof that you attended ${ticket.eventName} on ${ticket.date} at ${ticket.venue}, ${ticket.city}.`,
      attributes: [
        { trait_type: "Artist", value: ticket.artist },
        { trait_type: "Venue", value: ticket.venue },
        { trait_type: "City", value: ticket.city },
        { trait_type: "Date", value: ticket.date },
        { trait_type: "Ticket ID", value: ticket.ticketId },
        { trait_type: "Type", value: "Aftershow Collectible" },
      ],
    };

    return NextResponse.json(metadata);
  } catch (err) {
    console.error("metadata error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error fetching metadata" },
      { status: 500 }
    );
  }
}
