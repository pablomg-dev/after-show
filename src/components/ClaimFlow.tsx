"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { ArtworkGenerator } from "./ArtworkGenerator";
import type { EventTicket } from "@/lib/types";
import { generateArtwork } from "@/lib/artwork";

function svgToDataUriClient(svg: string): string {
  const encoded =
    typeof Buffer !== "undefined"
      ? Buffer.from(svg.trim()).toString("base64")
      : btoa(unescape(encodeURIComponent(svg.trim())));
  return `data:image/svg+xml;base64,${encoded}`;
}

const EXPLORER_DEVNET = "https://explorer.solana.com";

export function ClaimFlow() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [ticketId, setTicketId] = useState("");
  const [ticket, setTicket] = useState<EventTicket | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [mintLoading, setMintLoading] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [mintResult, setMintResult] = useState<{ mintAddress: string } | null>(null);

  const handleVerify = async () => {
    if (!ticketId.trim()) return;
    setVerifyLoading(true);
    setVerifyError(null);
    setTicket(null);
    try {
      const res = await fetch(`/api/verify-ticket?ticketId=${encodeURIComponent(ticketId.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error ?? "Error al verificar";
        setVerifyError(errorMsg);
        toast.error(errorMsg);
        return;
      }
      setTicket(data);
      toast.success(`Ticket verified: ${data.eventName}`);
      setStep(2);
    } catch (e) {
      const errorMsg = "Error de conexión";
      setVerifyError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setVerifyLoading(false);
    }
  };

  const { signTransaction } = useWallet();
  const { connection } = useConnection();

  const handleMint = async () => {
    if (!publicKey || !ticket || !signTransaction) return;
    setMintLoading(true);
    setMintError(null);
    const toastId = toast.loading("Minting your Aftershow NFT...");
    try {
      // Paso 1: Obtener la transacción desde el servidor
      const res = await fetch("/api/mint-aftershow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: ticket.ticketId,
          walletAddress: publicKey.toBase58(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error ?? "Error al mintear";
        setMintError(errorMsg);
        toast.error(errorMsg, { id: toastId });
        return;
      }

      toast.loading("Waiting for your signature...", { id: toastId });

      // Paso 2: Deserializar transacción base64
      const txBuffer = Buffer.from(data.transaction, "base64");
      const { VersionedTransaction } = await import("@solana/web3.js");
      let tx = VersionedTransaction.deserialize(txBuffer);

      // Paso 3: Firmar con Phantom
      tx = await signTransaction(tx);

      toast.loading("Sending transaction to blockchain...", { id: toastId });

      // Paso 4: Enviar transacción
      const { sendRawTransaction } = await import("@solana/web3.js");
      const signature = await connection.sendRawTransaction(tx.serialize());

      toast.loading("Confirming on blockchain...", { id: toastId });

      // Paso 5: Confirmar transacción
      const confirmation = await connection.confirmTransaction(signature, "confirmed");
      if (confirmation.value.err) {
        const errorMsg = "Transaction failed on-chain";
        setMintError(errorMsg);
        toast.error(errorMsg, { id: toastId });
        return;
      }

      // Paso 6: Marcar ticket como claimed en el servidor
      await fetch("/api/confirm-mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: ticket.ticketId }),
      });

      // Mostrar el signature (que es el hash de la transacción)
      setMintResult({ mintAddress: signature });
      setStep(3);
      
      toast.success("🎉 Your Aftershow NFT has been minted!", {
        id: toastId,
        description: "Check your collection to see it.",
      });
      
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Error de conexión";
      console.error("Mint error:", e);
      setMintError(errorMsg);
      toast.error(errorMsg, { id: toastId });
    } finally {
      setMintLoading(false);
    }
  };

  if (step === 3 && mintResult) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6">
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-6">
          <h2 className="text-xl font-bold text-emerald-400 mb-2">Success!</h2>
          <p className="text-white/80 text-sm mb-4">
            Your Aftershow NFT has been minted successfully.
          </p>
          <p className="font-mono text-xs text-white/60 break-all">TX: {mintResult.mintAddress}</p>
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            <a
              href={`${EXPLORER_DEVNET}/tx/${mintResult.mintAddress}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-medium transition-colors"
            >
              View Transaction
            </a>
            <button
              onClick={() => router.push(`/profile/${publicKey?.toBase58()}`)}
              className="inline-flex items-center rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              View My Collection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-8">
      {/* Paso 1 — Conectar wallet */}
      {step === 1 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center space-y-6">
          <h2 className="text-lg font-semibold text-white">Step 1 — Connect Wallet</h2>
          <p className="text-white/70 text-sm">
            Connect your Solana wallet to continue.
          </p>
          <div className="flex justify-center">
            <WalletMultiButton />
          </div>
          {connected && (
            <button
              onClick={() => setStep(2)}
              className="rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 px-6 py-3 font-semibold text-white hover:opacity-90"
            >
              Next
            </button>
          )}
        </div>
      )}

      {/* Paso 2 — Verificar ticket */}
      {step === 2 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-6">
          <h2 className="text-lg font-semibold text-white">Step 2 — Verify Ticket</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ticket ID (e.g. KYD-2026-001)"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              className="flex-1 rounded-lg bg-black/40 border border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              onClick={handleVerify}
              disabled={verifyLoading}
              className="rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {verifyLoading ? "Verifying…" : "Verify"}
            </button>
          </div>
          {verifyError && (
            <p className="text-sm text-red-400">{verifyError}</p>
          )}
          {ticket && (
            <div className="space-y-4">
              <div className="rounded-xl border border-violet-500/30 bg-black/30 p-4 text-left">
                <p className="font-semibold text-white">{ticket.eventName}</p>
                <p className="text-sm text-white/80">{ticket.artist} · {ticket.venue}</p>
                <p className="text-xs text-white/60">{ticket.city} · {ticket.date}</p>
              </div>
              <div className="flex justify-center">
                <ArtworkGenerator ticket={ticket} size={200} />
              </div>
              <button
                onClick={() => setStep(3)}
                className="w-full rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 py-3 font-semibold text-white hover:opacity-90"
              >
                Continue to Claim
              </button>
            </div>
          )}
        </div>
      )}

      {/* Paso 3 — Reclamar NFT */}
      {step === 3 && ticket && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-6">
          <h2 className="text-lg font-semibold text-white">Step 3 — Claim NFT</h2>
          <div className="flex justify-center">
            <div className="rounded-xl overflow-hidden border border-white/10" style={{ width: 240, height: 240 }}>
              <img
                src={svgToDataUriClient(generateArtwork(ticket))}
                alt={ticket.eventName}
                className="w-full h-full object-cover"
                width={240}
                height={240}
              />
            </div>
          </div>
          <p className="text-center text-sm text-white/70">{ticket.eventName} · {ticket.artist}</p>
          {mintLoading && (
            <p className="text-center text-xs text-white/50">
              This may take a few seconds on devnet. Don't close this page.
            </p>
          )}
          <button
            onClick={handleMint}
            disabled={mintLoading || !publicKey}
            className="w-full rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mintLoading ? "Minting your memory on-chain…" : "Convert Ticket to Aftershow NFT"}
          </button>
          {mintError && <p className="text-sm text-red-400 text-center">{mintError}</p>}
        </div>
      )}
    </div>
  );
}
