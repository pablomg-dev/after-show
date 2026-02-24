// Fuerza que Next.js no cachee este Server Component en Vercel.
// Sin esto, el perfil muestra datos viejos hasta que se invalida la caché manualmente.
export const dynamic = "force-dynamic";

import { Navbar } from "@/components/Navbar";
import { EventPassport } from "@/components/EventPassport";
import { CollectionShell } from "@/components/CollectionShell";
import Link from "next/link";

interface PageProps {
  params: Promise<{ wallet: string }>;
}

function truncateWallet(wallet: string): string {
  if (wallet.length <= 8) return wallet;
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

function avatarFromWallet(wallet: string): string {
  let h = 0;
  for (let i = 0; i < wallet.length; i++) {
    h = (h << 5) - h + wallet.charCodeAt(i);
    h = h & h;
  }
  const hue = Math.abs(h) % 360;
  return `hsl(${hue}, 60%, 45%)`;
}

async function getNfts(wallet: string) {
  const { fetchAftershowNftsByOwner } = await import("@/lib/solana");
  return fetchAftershowNftsByOwner(wallet);
}

export default async function ProfilePage({ params }: PageProps) {
  const { wallet } = await params;
  const nfts = await getNfts(wallet);
  const cities = [...new Set(nfts.map((n: { city: string }) => n.city))];
  const artists = [...new Set(nfts.map((n: { artist: string }) => n.artist))];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14 px-4 py-12 max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
            style={{ backgroundColor: avatarFromWallet(wallet) }}
          >
            {truncateWallet(wallet).slice(0, 2).toUpperCase()}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-white font-mono">
              {truncateWallet(wallet)}
            </h1>
            <p className="text-white/60 text-sm mt-1">My Cultural Passport</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-white/70">
              <span>{nfts.length} events attended</span>
              <span>{cities.length} cities</span>
              <span>{artists.length} unique artists</span>
            </div>
          </div>
        </header>

        <section>
          <h2 className="text-lg font-semibold text-white mb-6">Collection</h2>
          <CollectionShell initialNfts={nfts} wallet={wallet} />
        </section>
      </main>
    </div>
  );
}
