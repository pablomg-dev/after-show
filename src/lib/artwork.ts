import type { EventTicket } from "./types";

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h = (h << 5) - h + c;
    h = h & h;
  }
  return Math.abs(h);
}

function seedFromTicket(ticket: EventTicket): number {
  return hashString(ticket.artist + ticket.venue + ticket.date);
}

export function generateArtwork(ticket: EventTicket): string {
  const seed = seedFromTicket(ticket);
  const hue = seed % 360;
  const hue2 = (hue + 180 + (seed % 60)) % 360;
  const sat = 55 + (seed % 25);
  const light1 = 12 + (seed % 8);
  const light2 = 28 + (seed % 12);

  const gradientId = `g-${seed}`;
  const waveId = `w-${seed}`;
  const particles = Array.from({ length: 12 }, (_, i) => {
    const x = 20 + (seed * (i + 1)) % 360;
    const y = 30 + (seed * (i + 3)) % 340;
    const r = 2 + (seed % 3);
    const opacity = 0.15 + (seed % 10) / 100;
    return { x, y, r, opacity };
  });

  const wavePoints = Array.from({ length: 8 }, (_, i) => {
    const x = (i / 7) * 400;
    const y = 200 + Math.sin((seed + i * 0.5) * 0.3) * 40 + (i % 2) * 20;
    return `${x},${y}`;
  }).join(" ");

  const artistLines = ticket.artist.length > 18
    ? [ticket.artist.slice(0, 18), ticket.artist.slice(18)]
    : [ticket.artist];

  // Format date deterministically without toLocaleDateString to avoid hydration mismatch
  const [year, month, day] = ticket.date.split('-');
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const monthName = months[parseInt(month) - 1];
  const dateFormatted = `${parseInt(day)} ${monthName} ${year}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:hsl(${hue},${sat}%,${light1}%);stop-opacity:1" />
      <stop offset="50%" style="stop-color:hsl(${hue2},${sat}%,${light2}%);stop-opacity:1" />
      <stop offset="100%" style="stop-color:#080808;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="400" height="400" fill="url(#${gradientId})"/>
  ${particles.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="white" opacity="${p.opacity}"/>`).join("\n  ")}
  <polyline id="${waveId}" points="${wavePoints}" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeLinecap="round"/>
  <rect x="20" y="260" width="360" height="1" fill="rgba(255,255,255,0.15)"/>
  <text x="200" y="120" text-anchor="middle" fill="white" font-family="system-ui, sans-serif" font-size="28" font-weight="700" filter="url(#glow)">${artistLines[0]}</text>
  ${artistLines[1] ? `<text x="200" y="152" text-anchor="middle" fill="white" font-family="system-ui, sans-serif" font-size="28" font-weight="700" filter="url(#glow)">${artistLines[1]}</text>` : ""}
  <text x="200" y="300" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="system-ui, sans-serif" font-size="14" font-weight="500">${escapeXml(ticket.venue)}</text>
  <text x="200" y="322" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="system-ui, sans-serif" font-size="12">${escapeXml(ticket.city)} · ${dateFormatted}</text>
  <rect x="160" y="340" width="80" height="24" rx="4" fill="rgba(139,92,246,0.4)" stroke="rgba(139,92,246,0.8)" stroke-width="1"/>
  <text x="200" y="356" text-anchor="middle" fill="white" font-family="system-ui, sans-serif" font-size="10" font-weight="600">AFTERSHOW</text>
</svg>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function svgToDataUri(svg: string): string {
  const encoded = Buffer.from(svg.trim()).toString("base64");
  return `data:image/svg+xml;base64,${encoded}`;
}
