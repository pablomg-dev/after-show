"use client";

import { useMemo } from "react";
import { generateArtwork } from "@/lib/artwork";
import type { EventTicket } from "@/lib/types";

function svgToDataUriClient(svg: string): string {
  const encoded =
    typeof Buffer !== "undefined"
      ? Buffer.from(svg.trim()).toString("base64")
      : btoa(unescape(encodeURIComponent(svg.trim())));
  return `data:image/svg+xml;base64,${encoded}`;
}

interface ArtworkGeneratorProps {
  ticket: EventTicket;
  className?: string;
  size?: number;
}

export function ArtworkGenerator({ ticket, className = "", size = 400 }: ArtworkGeneratorProps) {
  const imageUri = useMemo(() => {
    const svg = generateArtwork(ticket);
    return svgToDataUriClient(svg);
  }, [ticket.ticketId, ticket.artist, ticket.venue, ticket.date]);

  return (
    <div
      className={`rounded-lg overflow-hidden border border-white/10 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={imageUri}
        alt={`Artwork ${ticket.eventName}`}
        className="w-full h-full object-cover"
        width={size}
        height={size}
      />
    </div>
  );
}
