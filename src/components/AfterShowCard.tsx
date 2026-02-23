"use client";

import { Check } from "lucide-react";
import type { AfterShowNFT } from "@/lib/types";

function svgToDataUriClient(svg: string): string {
  const encoded = typeof Buffer !== "undefined"
    ? Buffer.from(svg.trim()).toString("base64")
    : btoa(unescape(encodeURIComponent(svg.trim())));
  return `data:image/svg+xml;base64,${encoded}`;
}

interface AfterShowCardProps {
  nft: AfterShowNFT;
  className?: string;
}

export function AfterShowCard({ nft, className = "" }: AfterShowCardProps) {
  // Format date deterministically without toLocaleDateString to avoid hydration mismatch
  const [year, month, day] = nft.date.split('-');
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const monthName = months[parseInt(month) - 1];
  const dateFormatted = `${parseInt(day)} ${monthName} ${year}`;

  const imageUri = svgToDataUriClient(nft.artworkSvg);

  return (
    <article
      className={`
        w-[280px] rounded-xl overflow-hidden
        bg-[#141414] border border-white/10
        hover:border-violet-500/40 hover:shadow-glow-sm hover:-translate-y-0.5
        transition-all duration-300
        ${className}
      `}
    >
      <div className="relative aspect-square w-full" style={{ minHeight: 196 }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUri})` }}
        />
      </div>
      <div className="p-3 space-y-1">
        <p className="font-bold text-white truncate" title={nft.artist}>
          {nft.artist}
        </p>
        <p className="text-xs text-white/70 truncate">
          {nft.venue} · {nft.city}
        </p>
        <p className="text-xs text-white/50">{dateFormatted}</p>
        <div className="flex items-center gap-1.5 pt-1">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400">
            <Check className="w-3 h-3" />
            Verified on-chain
          </span>
        </div>
      </div>
    </article>
  );
}
