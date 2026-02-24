"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { Ticket, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { publicKey } = useWallet();
  const [isMounted, setIsMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Cierra el menú cuando cambia la ruta
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const walletAddress = publicKey?.toBase58() ?? null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080808]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-white font-semibold text-lg hover:opacity-90">
          <Ticket className="w-6 h-6 text-violet-400" />
          Aftershow
        </Link>

        {/* Links en desktop */}
        <div className="hidden sm:flex items-center gap-6">
          <Link
            href="/claim"
            className={`text-sm font-medium transition-colors ${pathname === "/claim" ? "text-violet-400" : "text-white/80 hover:text-white"
              }`}
          >
            Claim
          </Link>
          {isMounted && walletAddress && (
            <Link
              href={`/profile/${walletAddress}`}
              className={`text-sm font-medium transition-colors ${pathname?.startsWith("/profile") ? "text-violet-400" : "text-white/80 hover:text-white"
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

        {/* Botón hamburguesa en mobile */}
        <button
          className="sm:hidden text-white/80 hover:text-white p-1"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Menú desplegable en mobile */}
      {menuOpen && (
        <div className="sm:hidden border-t border-white/10 bg-[#080808]/95 px-4 py-4 flex flex-col items-end gap-4">
          <Link
            href="/claim"
            className={`text-sm font-medium transition-colors ${pathname === "/claim" ? "text-violet-400" : "text-white/80 hover:text-white"
              }`}
          >
            Claim
          </Link>
          {isMounted && walletAddress && (
            <Link
              href={`/profile/${walletAddress}`}
              className={`text-sm font-medium transition-colors ${pathname?.startsWith("/profile") ? "text-violet-400" : "text-white/80 hover:text-white"
                }`}
            >
              My Collection
            </Link>
          )}
          {isMounted && (
            <div>
              <WalletMultiButton className="w-full text-sm" />
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
