import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { AfterShowCard } from "@/components/AfterShowCard";
import { generateArtwork } from "@/lib/artwork";
import { MOCK_TICKETS } from "@/lib/mock-tickets";
import type { AfterShowNFT } from "@/lib/types";
import { Ticket, Shield, Palette, Link2 } from "lucide-react";

// 3 cards de ejemplo para la landing (artwork generado desde tickets mock)
function getExampleNfts(): AfterShowNFT[] {
  const [t1, t2, t3] = MOCK_TICKETS.slice(0, 3);
  // Use a fixed timestamp to avoid hydration mismatch
  const now = "2026-02-23T00:00:00Z";
  return [
    {
      mintAddress: "example-1",
      ticketId: t1.ticketId,
      eventName: t1.eventName,
      artist: t1.artist,
      venue: t1.venue,
      city: t1.city,
      date: t1.date,
      artworkSvg: generateArtwork(t1),
      claimedAt: now,
      ownerWallet: "",
    },
    {
      mintAddress: "example-2",
      ticketId: t2.ticketId,
      eventName: t2.eventName,
      artist: t2.artist,
      venue: t2.venue,
      city: t2.city,
      date: t2.date,
      artworkSvg: generateArtwork(t2),
      claimedAt: now,
      ownerWallet: "",
    },
    {
      mintAddress: "example-3",
      ticketId: t3.ticketId,
      eventName: t3.eventName,
      artist: t3.artist,
      venue: t3.venue,
      city: t3.city,
      date: t3.date,
      artworkSvg: generateArtwork(t3),
      claimedAt: now,
      ownerWallet: "",
    },
  ];
}

export default function HomePage() {
  const examples = getExampleNfts();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14">
        <section className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Your ticket doesn't disappear.
            <br />
            It becomes history.
          </h1>
          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
            Aftershow turns your event tickets into collectible NFTs that prove forever you were there.
          </p>
          <Link
            href="/claim"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-8 py-4 text-lg font-semibold text-white hover:opacity-90 transition-opacity shadow-glow-sm"
          >
            <Ticket className="w-5 h-5" />
            Claim My Aftershow NFT
          </Link>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Verify your ticket</h3>
              <p className="text-sm text-white/60">
                Enter your KYD ticket ID after the event to validate it.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
                <Palette className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">We generate your unique art</h3>
              <p className="text-sm text-white/60">
                Each NFT has generative artwork based on the event.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
                <Link2 className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Your memory lives on-chain</h3>
              <p className="text-sm text-white/60">
                The NFT stays on Solana as verifiable proof forever.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Your Cultural Passport</h2>
          <p className="text-white/70 text-center mb-10 max-w-xl mx-auto">
            Collect all your Aftershow NFTs in one profile. Show your concert and event history as a verified on-chain cultural passport.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">Sample Aftershow NFTs</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {examples.map((nft) => (
              <AfterShowCard key={nft.mintAddress} nft={nft} />
            ))}
          </div>
        </section>

        <footer className="border-t border-white/10 py-8 mt-20">
          <div className="max-w-4xl mx-auto px-4 text-center text-white/50 text-sm">
            Aftershow — Your ticket becomes history. Built on Solana.
          </div>
        </footer>
      </main>
    </div>
  );
}
