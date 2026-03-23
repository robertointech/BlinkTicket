"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Transaction, Connection } from "@solana/web3.js";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import { getEventType } from "@/lib/event-types";
import { useEvents, findEventBySlug } from "@/lib/use-events";

const RPC = process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";
const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://blink-ticket.vercel.app";

export default function EventDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { publicKey, signTransaction, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { events, onChainLoaded } = useEvents();

  const [buying, setBuying] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const event = findEventBySlug(events, slug);
  const loading = !onChainLoaded && !event;

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const handleBuy = async () => {
    if (!event || !publicKey || !signTransaction) return;
    setBuying(true);
    try {
      const res = await fetch("/api/buy-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.eventId,
          authority: event.authority,
          buyerPubkey: publicKey.toBase58(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const tx = Transaction.from(Buffer.from(data.transaction, "base64"));
      const signed = await signTransaction(tx);
      const connection = new Connection(RPC, "confirmed");
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, "confirmed");

      showToast("Ticket purchased! Check My Tickets.", true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Transaction failed", false);
    } finally {
      setBuying(false);
    }
  };

  const blinkUrl = event
    ? `${BASE_URL}/api/actions/buy-ticket?eventId=${event.eventId}&authority=${event.authority}&name=${encodeURIComponent(event.name)}&desc=${encodeURIComponent(event.description)}&price=${event.ticketPrice / 1e9}&max=${event.maxTickets}&type=${event.eventType}`
    : "";
  const dialUrl = blinkUrl ? `https://dial.to/?action=solana-action:${encodeURIComponent(blinkUrl)}` : "";

  const copyBlink = () => {
    navigator.clipboard.writeText(dialUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070d] text-gray-100">
        <Navbar />
        <div className="max-w-2xl mx-auto px-5 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-white/5 rounded w-1/3" />
            <div className="h-10 bg-white/5 rounded w-2/3" />
            <div className="h-4 bg-white/5 rounded w-full" />
            <div className="h-12 bg-white/5 rounded mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#07070d] text-gray-100">
        <Navbar />
        <div className="max-w-2xl mx-auto px-5 py-16 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold mb-2">Event not found</h2>
          <p className="text-gray-500 mb-6">This event may have been closed or doesn&apos;t exist.</p>
          <Link href="/events" className="text-purple-400 hover:text-purple-300 underline text-sm">Back to Events</Link>
        </div>
      </div>
    );
  }

  const t = getEventType(event.eventType);
  const remaining = event.maxTickets - event.ticketsSold;
  const soldOut = remaining <= 0;
  const priceSol = event.ticketPrice / 1_000_000_000;
  const percent = Math.round((event.ticketsSold / event.maxTickets) * 100);

  return (
    <div className="min-h-screen bg-[#07070d] text-gray-100">
      <Navbar />

      {toast && (
        <div className={`fixed top-20 right-5 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border ${
          toast.ok ? "bg-teal-500/10 border-teal-500/30 text-teal-300" : "bg-red-500/10 border-red-500/30 text-red-300"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-5 py-12">
        <div className="text-xs text-gray-500 mb-6">
          <Link href="/events" className="hover:text-gray-300 transition">Events</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-400">{event.name}</span>
        </div>

        <div className={`rounded-2xl border border-white/5 bg-gradient-to-br ${t.gradient} p-6 sm:p-8 mb-6`}>
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${t.badge}`}>
              {t.icon} {t.label}
            </span>
            {event.isDemoEvent && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 text-gray-500">Demo</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{event.name}</h1>
          {event.city && (
            <p className="text-xs text-gray-500 mb-3">📍 {event.city}{event.date ? ` · ${event.date}` : ""}</p>
          )}
          <p className="text-gray-400 text-sm leading-relaxed mb-6">{event.description}</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-black/20 rounded-xl p-3 text-center">
              <div className="text-lg font-bold">{priceSol}</div>
              <div className="text-[10px] text-gray-500 uppercase">SOL</div>
            </div>
            <div className="bg-black/20 rounded-xl p-3 text-center">
              <div className="text-lg font-bold">{remaining}</div>
              <div className="text-[10px] text-gray-500 uppercase">Remaining</div>
            </div>
            <div className="bg-black/20 rounded-xl p-3 text-center">
              <div className="text-lg font-bold">{event.ticketsSold}</div>
              <div className="text-[10px] text-gray-500 uppercase">Sold</div>
            </div>
          </div>

          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-gradient-to-r from-purple-500 to-teal-500 rounded-full transition-all" style={{ width: `${percent}%` }} />
          </div>

          {event.isDemoEvent ? (
            <button
              onClick={() => showToast("Demo event — connect to Devnet for real events", false)}
              className="w-full py-3 rounded-xl border border-white/10 font-semibold transition text-gray-400 text-base"
            >
              Buy Ticket — {priceSol} SOL
            </button>
          ) : connected ? (
            <button
              disabled={soldOut || buying}
              onClick={handleBuy}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-teal-500 font-semibold hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed text-base"
            >
              {buying ? "Processing..." : soldOut ? "Sold Out" : `Buy Ticket — ${priceSol} SOL (Gasless)`}
            </button>
          ) : (
            <button
              onClick={() => setVisible(true)}
              className="w-full py-3 rounded-xl border border-white/10 font-semibold hover:bg-white/5 transition text-base"
            >
              Connect Wallet to Buy
            </button>
          )}
        </div>

        {!event.isDemoEvent && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mb-6">
            <h3 className="font-bold text-sm mb-3">Share this event</h3>
            <div className="flex gap-2">
              <input readOnly value={dialUrl} className="flex-1 bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-xs font-mono text-gray-400 truncate" />
              <button onClick={copyBlink} className="px-4 py-2 rounded-lg bg-purple-600/80 text-xs font-semibold hover:brightness-110 transition whitespace-nowrap">
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <h3 className="font-bold text-sm mb-3">Details</h3>
          <div className="space-y-2 text-xs">
            {!event.isDemoEvent && (
              <div className="flex justify-between text-gray-400">
                <span>Event PDA</span>
                <a href={`https://explorer.solana.com/address/${event.pda}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 font-mono">
                  {event.pda.slice(0, 8)}...{event.pda.slice(-4)} ↗
                </a>
              </div>
            )}
            <div className="flex justify-between text-gray-400">
              <span>Event ID</span>
              <span className="font-mono">{event.eventId}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Status</span>
              <span className={event.isActive ? "text-teal-400" : "text-red-400"}>{event.isActive ? "Active" : "Inactive"}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Network</span>
              <span>Solana Devnet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
