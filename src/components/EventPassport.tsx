"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { AfterShowCard } from "./AfterShowCard";
import type { AfterShowNFT } from "@/lib/types";

interface EventPassportProps {
  nfts: AfterShowNFT[];
  emptyMessage?: string;
  emptyCta?: { label: string; href: string };
}

export function EventPassport({ nfts, emptyMessage, emptyCta }: EventPassportProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "artist" | "city">("all");

  const filteredNfts = useMemo(() => {
    if (!searchQuery.trim()) return nfts;

    const query = searchQuery.toLowerCase();
    return nfts.filter((nft) => {
      if (filterBy === "artist") {
        return nft.artist.toLowerCase().includes(query);
      } else if (filterBy === "city") {
        return nft.city.toLowerCase().includes(query);
      } else {
        return (
          nft.artist.toLowerCase().includes(query) ||
          nft.city.toLowerCase().includes(query) ||
          nft.eventName.toLowerCase().includes(query) ||
          nft.venue.toLowerCase().includes(query)
        );
      }
    });
  }, [nfts, searchQuery, filterBy]);

  if (nfts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-12 text-center">
        <p className="text-white/70 mb-4">{emptyMessage ?? "You don't have any Aftershow NFTs yet."}</p>
        {emptyCta && (
          <a
            href={emptyCta.href}
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 px-6 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
          >
            {emptyCta.label}
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <label className="flex items-center gap-2 text-sm text-white/60">
            Filter by:
          </label>
          {(["all", "artist", "city"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterBy(filter)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                filterBy === filter
                  ? "bg-violet-500 text-white"
                  : "bg-white/10 text-white/70 hover:text-white"
              }`}
            >
              {filter === "all" ? "All" : filter === "artist" ? "Artist" : "City"}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder={
              filterBy === "artist"
                ? "Search by artist..."
                : filterBy === "city"
                  ? "Search by city..."
                  : "Search events, artists, cities..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {filteredNfts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white/60">No results found for "{searchQuery}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNfts.map((nft) => (
            <AfterShowCard key={nft.mintAddress} nft={nft} />
          ))}
        </div>
      )}
    </div>
  );
}
