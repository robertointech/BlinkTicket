"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Transaction, Connection } from "@solana/web3.js";
import Link from "next/link";
import { Navbar } from "../components/Navbar";
import { EVENT_TYPES, getEventType, type OnChainEvent } from "@/lib/event-types";
import { useEvents } from "@/lib/use-events";

const RPC = process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";

export default function EventsPage() {
  const searchParams = useSearchParams();
  const { publicKey, signTransaction, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { events, onChainLoaded } = useEvents();
  const [filter, setFilter] = useState(-1);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [createdBlink, setCreatedBlink] = useState<string | null>(null);
  const [copiedBlink, setCopiedBlink] = useState(false);

  // Show success toast when redirected from /create
  useEffect(() => {
    if (searchParams?.get("created") === "1") {
      setToast({ msg: "Event created on-chain!", ok: true });
      setTimeout(() => setToast(null), 5000);
      const blink = searchParams.get("dial");
      if (blink) setCreatedBlink(blink);
      window.history.replaceState({}, "", "/events");
    }
  }, [searchParams]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const handleBuy = async (ev: OnChainEvent) => {
    if (!publicKey || !signTransaction) return;
    setBuyingId(ev.pda);
    try {
      const res = await fetch("/api/buy-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: ev.eventId,
          authority: ev.authority,
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

      showToast(`Ticket purchased for "${ev.name}"!`, true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Transaction failed", false);
    } finally {
      setBuyingId(null);
    }
  };

  const filtered = filter === -1 ? events : events.filter((e) => e.eventType === filter);

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

      <div className="max-w-6xl mx-auto px-5 py-12">
        {createdBlink && (
          <div className="mb-6 rounded-xl border border-teal-500/20 bg-teal-500/5 p-4">
            <p className="text-sm font-semibold text-teal-300 mb-2">🎉 Event created! Share your Blink:</p>
            <div className="flex gap-2">
              <input readOnly value={createdBlink} className="flex-1 bg-black/20 border border-white/5 rounded-lg px-3 py-1.5 text-xs font-mono text-gray-400 truncate" />
              <button
                onClick={() => { navigator.clipboard.writeText(createdBlink); setCopiedBlink(true); setTimeout(() => setCopiedBlink(false), 2000); }}
                className="px-3 py-1.5 rounded-lg bg-teal-600/80 text-xs font-semibold hover:brightness-110 transition"
              >
                {copiedBlink ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Explore{" "}
            <span className="bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">Events</span>
          </h1>
          {!onChainLoaded && (
            <span className="text-[10px] text-gray-600 animate-pulse">Loading on-chain...</span>
          )}
        </div>
        <p className="text-gray-500 mb-8">Discover on-chain events powered by Solana.</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilter(-1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === -1 ? "bg-white/10 text-white" : "bg-white/[0.03] text-gray-400 hover:bg-white/5"
            }`}
          >
            All
          </button>
          {EVENT_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filter === t.value ? "bg-white/10 text-white" : "bg-white/[0.03] text-gray-400 hover:bg-white/5"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎪</div>
            <p className="text-gray-400 mb-2 text-lg">No events found.</p>
            <Link
              href="/create"
              className="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-teal-500 font-semibold text-sm hover:brightness-110 transition"
            >
              Create Event
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((ev) => {
              const t = getEventType(ev.eventType);
              const remaining = ev.maxTickets - ev.ticketsSold;
              const soldOut = remaining <= 0;
              const priceSol = ev.ticketPrice / 1_000_000_000;

              return (
                <div
                  key={`${ev.authority}-${ev.eventId}`}
                  className={`group rounded-2xl border border-white/5 bg-gradient-to-b ${t.gradient} overflow-hidden transition-all hover:border-white/10`}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${t.badge}`}>
                          {t.icon} {t.label}
                        </span>
                        {ev.isDemoEvent && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 text-gray-500">Demo</span>
                        )}
                      </div>
                      {soldOut && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-300">Sold Out</span>
                      )}
                    </div>

                    <Link href={`/events/${ev.authority}-${ev.eventId}`}>
                      <h3 className="font-bold text-lg mb-1 group-hover:text-white transition line-clamp-1">{ev.name}</h3>
                    </Link>

                    <p className="text-xs text-gray-400 leading-relaxed mb-2 line-clamp-2">{ev.description}</p>

                    {ev.city && (
                      <p className="text-[10px] text-gray-600 mb-3">📍 {ev.city}{ev.date ? ` · ${ev.date}` : ""}</p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span className="font-semibold text-gray-300">{priceSol} SOL</span>
                      <span>{remaining}/{ev.maxTickets} remaining</span>
                    </div>

                    {ev.isDemoEvent ? (
                      <button
                        onClick={() => showToast("Demo event — connect to Devnet for real events", false)}
                        className="w-full py-2.5 rounded-lg border border-white/10 font-semibold text-sm hover:bg-white/5 transition text-gray-400"
                      >
                        Buy Ticket — {priceSol} SOL
                      </button>
                    ) : connected ? (
                      <button
                        disabled={soldOut || buyingId === ev.pda}
                        onClick={() => handleBuy(ev)}
                        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-teal-500 font-semibold text-sm hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {buyingId === ev.pda ? "Processing..." : soldOut ? "Sold Out" : `Buy Ticket — ${priceSol} SOL`}
                      </button>
                    ) : (
                      <button
                        onClick={() => setVisible(true)}
                        className="w-full py-2.5 rounded-lg border border-white/10 font-semibold text-sm hover:bg-white/5 transition"
                      >
                        Connect Wallet
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
