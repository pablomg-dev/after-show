import { NextRequest, NextResponse } from "next/server";
import { getTicketById } from "@/lib/mock-tickets";

export async function GET(request: NextRequest) {
  const ticketId = request.nextUrl.searchParams.get("ticketId");
  if (!ticketId) {
    return NextResponse.json(
      { error: "Falta ticketId" },
      { status: 400 }
    );
  }

  const ticket = getTicketById(ticketId);
  if (!ticket) {
    return NextResponse.json(
      { error: "Ticket no encontrado" },
      { status: 404 }
    );
  }
  if (ticket.claimed) {
    return NextResponse.json(
      { error: "Este ticket ya fue reclamado" },
      { status: 400 }
    );
  }
  if (!ticket.verified) {
    return NextResponse.json(
      { error: "Ticket no verificado" },
      { status: 400 }
    );
  }

  return NextResponse.json(ticket, { status: 200 });
}
