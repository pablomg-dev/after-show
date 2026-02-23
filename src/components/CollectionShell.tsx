"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import type { AfterShowNFT } from "@/lib/types";
import { EventPassport } from "./EventPassport";

interface Props {
  initialNfts: AfterShowNFT[];
  wallet: string;
}

export function CollectionShell({ initialNfts, wallet }: Props) {
  const [nfts, setNfts] = useState<AfterShowNFT[]>(initialNfts ?? []);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    try {
      setLoading(true);
      const res = await fetch(`/api/nfts-by-owner?wallet=${encodeURIComponent(wallet)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error fetching NFTs");
      setNfts(data.nfts ?? []);
    } catch (e) {
      console.error("Refresh NFTs error:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <EventPassport nfts={nfts} emptyMessage="You don't have any Aftershow NFTs yet." />
    </div>
  );
}
