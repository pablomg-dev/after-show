import type { EventTicket } from "./types";

export const MOCK_TICKETS: EventTicket[] = [
  {
    ticketId: "KYD-2026-001",
    eventName: "The Last World Tour",
    artist: "Bad Bunny",
    venue: "Monumental Stadium",
    city: "Buenos Aires",
    date: "2026-01-15",
    seat: "Sector A - Row 12",
    verified: true,
    claimed: false,
  },
  {
    ticketId: "KYD-2026-002",
    eventName: "Renaissance World Tour",
    artist: "Beyoncé",
    venue: "River Plate",
    city: "Buenos Aires",
    date: "2026-02-03",
    seat: "VIP Field",
    verified: true,
    claimed: false,
  },
  {
    ticketId: "KYD-2026-003",
    eventName: "Live at Luna Park",
    artist: "Indio Solari",
    venue: "Luna Park",
    city: "Buenos Aires",
    date: "2026-03-20",
    seat: "Upper Circle",
    verified: true,
    claimed: false,
  },
  {
    ticketId: "KYD-2026-004",
    eventName: "Ultra Buenos Aires",
    artist: "Various (EDM)",
    venue: "Hipódromo de Palermo",
    city: "Buenos Aires",
    date: "2026-04-12",
    seat: "Main Floor",
    verified: true,
    claimed: false,
  },
  {
    ticketId: "KYD-2026-005",
    eventName: "Chromatica Ball",
    artist: "Lady Gaga",
    venue: "Movistar Arena",
    city: "Buenos Aires",
    date: "2026-05-08",
    seat: "Sector B - Row 5",
    verified: true,
    claimed: false,
  },
  {
    ticketId: "KYD-2026-006",
    eventName: "Jazz Night",
    artist: "Herbie Hancock",
    venue: "Cultural Center",
    city: "Buenos Aires",
    date: "2026-06-22",
    seat: "Symphony Hall",
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
