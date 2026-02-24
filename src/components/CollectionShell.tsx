"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import type { AfterShowNFT } from "@/lib/types";
import { EventPassport } from "./EventPassport";

interface Props {
  wallet: string;
}

export function CollectionShell({ wallet }: Props) {
  const [nfts, setNfts] = useState<AfterShowNFT[]>([]);
  const [loading, setLoading] = useState(true);

  // Centraliza el fetch para usarlo tanto en el mount inicial como en el refresh manual
  const fetchNfts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/nfts-by-owner?wallet=${encodeURIComponent(wallet)}`, {
        // Evitar que el browser cachee esta request entre reloads
        cache: "no-store",
      });
      const data = await res.json() as { nfts?: AfterShowNFT[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Error fetching NFTs");
      setNfts(data.nfts ?? []);
    } catch (e) {
      console.error("Fetch NFTs error:", e);
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  // Carga inicial en el cliente — siempre fresca, sin caché del Server Component
  useEffect(() => {
    fetchNfts();
  }, [fetchNfts]);

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={fetchNfts}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <RefreshCw className="w-6 h-6 text-white/40 animate-spin" />
        </div>
      ) : (
        <>
          {nfts.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-6 text-sm text-white/70">
              <span>{nfts.length} events attended</span>
              <span>{new Set(nfts.map((n) => n.city)).size} cities</span>
              <span>{new Set(nfts.map((n) => n.artist)).size} unique artists</span>
            </div>
          )}
          <EventPassport nfts={nfts} emptyMessage="You don't have any Aftershow NFTs yet." />
        </>
      )}
    </div>
  );
}
