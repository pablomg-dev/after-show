import type { EventTicket } from "./types";

export const MOCK_TICKETS: EventTicket[] = [
  {
    ticketId: "KYD-2026-001",
    eventName: "Charli XCX: BRAT Tour",
    artist: "Charli XCX",
    venue: "Le Poisson Rouge",
    city: "New York",
    date: "2026-01-15",
    seat: "General Admission",
    verified: true,
    claimed: false,
  },
  {
    ticketId: "KYD-2026-002",
    eventName: "Travis Scott: Utopia Live",
    artist: "Travis Scott",
    venue: "Le Poisson Rouge",
    city: "New York",
    date: "2026-01-28",
    seat: "Floor - Section A",
    verified: true,
    claimed: false,
  },
  {
    ticketId: "KYD-2026-003",
    eventName: "Dillon Francis: IDGAFOS Night",
    artist: "Dillon Francis",
    venue: "Brooklyn Mirage",
    city: "New York",
    date: "2026-02-05",
    seat: "VIP",
    verified: true,
    claimed: false,
  },
  {
    ticketId: "KYD-2026-004",
    eventName: "Robert Plant: Saving Grace Tour",
    artist: "Robert Plant",
    venue: "Radio City Music Hall",
    city: "New York",
    date: "2026-02-10",
    seat: "Orchestra - Row 8",
    verified: true,
    claimed: false,
  },
  {
    ticketId: "KYD-2026-005",
    eventName: "Charli XCX: BRAT Tour",
    artist: "Charli XCX",
    venue: "The Fonda Theatre",
    city: "Los Angeles",
    date: "2026-02-18",
    seat: "General Admission",
    verified: true,
    claimed: false,
  },
  {
    ticketId: "KYD-2026-006",
    eventName: "Dillon Francis: Spring Residency",
    artist: "Dillon Francis",
    venue: "Exchange LA",
    city: "Los Angeles",
    date: "2026-02-22",
    seat: "VIP Table",
    verified: true,
    claimed: false,
  },
];

// Store mutable para marcar tickets como claimed (en memoria)
const ticketsStore = [...MOCK_TICKETS];

export function getTicketsStore(): EventTicket[] {
  return ticketsStore;
}

export function markTicketAsClaimed(ticketId: string): void {
  const t = ticketsStore.find((x) => x.ticketId === ticketId);
  if (t) t.claimed = true;
}

export function getTicketById(ticketId: string): EventTicket | undefined {
  return ticketsStore.find((x) => x.ticketId === ticketId);
}
