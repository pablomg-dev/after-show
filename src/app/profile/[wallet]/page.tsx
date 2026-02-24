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


export default async function ProfilePage({ params }: PageProps) {
  const { wallet } = await params;

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

          </div>
        </header>

        <section>
          <h2 className="text-lg font-semibold text-white mb-6">Collection</h2>
          <CollectionShell wallet={wallet} />
        </section>
      </main>
    </div>
  );
}
