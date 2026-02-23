"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { Ticket } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { publicKey } = useWallet();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const walletShort = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080808]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white font-semibold text-lg hover:opacity-90">
          <Ticket className="w-6 h-6 text-violet-400" />
          Aftershow
        </Link>
        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/claim"
            className={`text-sm font-medium transition-colors ${
              pathname === "/claim" ? "text-violet-400" : "text-white/80 hover:text-white"
            }`}
          >
            Claim
          </Link>
          {isMounted && publicKey && (
            <Link
              href={`/profile/${publicKey.toBase58()}`}
              className={`text-sm font-medium transition-colors hidden sm:inline-flex ${
                pathname?.startsWith("/profile") ? "text-violet-400" : "text-white/80 hover:text-white"
              }`}
            >
              My Collection
            </Link>
          )}
          {isMounted && (
            <div className="flex-shrink-0">
              <WalletMultiButton className="max-w-[160px] truncate text-sm px-3 py-1 sm:px-4 sm:py-2" />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
