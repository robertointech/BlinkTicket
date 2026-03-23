"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Transaction, Connection } from "@solana/web3.js";
import Link from "next/link";

const EVENT_TYPES = [
  { value: 0, label: "Conference / Meetup", icon: "🎪" },
  { value: 1, label: "Research / DeSci", icon: "🔬" },
  { value: 2, label: "Music & Art", icon: "🎵" },
  { value: 3, label: "Community / DAO", icon: "👥" },
  { value: 4, label: "Open / Other", icon: "🚀" },
];

export default function CreateEventPage() {
  const { publicKey, signTransaction, connected } = useWallet();
  const { setVisible } = useWalletModal();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceSol, setPriceSol] = useState("0.05");
  const [maxTickets, setMaxTickets] = useState("100");
  const [eventType, setEventType] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blinkUrl: string; dialUrl: string; eventPDA: string } | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !signTransaction) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Generate a unique event ID from timestamp
      const eventId = Math.floor(Date.now() / 1000);

      const res = await fetch("/api/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          ticketPriceSol: parseFloat(priceSol),
          maxTickets: parseInt(maxTickets),
          eventType,
          authorityPubkey: publicKey.toBase58(),
          eventId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create transaction");

      // Deserialize and sign
      const txBuf = Buffer.from(data.transaction, "base64");
      const transaction = Transaction.from(txBuf);
      const signed = await signTransaction(transaction);

      // Send
      const connection = new Connection(
        process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com",
        "confirmed"
      );
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, "confirmed");

      setResult({
        blinkUrl: data.blinkUrl,
        dialUrl: data.dialUrl,
        eventPDA: data.eventPDA,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07070d] text-gray-100">
      {/* Nav */}
      <header className="border-b border-white/5 bg-[#07070d]/70 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between h-14 px-5">
          <Link href="/" className="text-lg font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
            BlinkTicket
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/my-tickets" className="text-sm text-gray-400 hover:text-white transition">
              My Tickets
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 py-16">
        <h1 className="text-3xl font-bold mb-2">
          Create <span className="bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">Event</span>
        </h1>
        <p className="text-gray-500 mb-8">
          Create an on-chain event and get a shareable Blink URL.
        </p>

        {!connected ? (
          <button
            onClick={() => setVisible(true)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-teal-500 font-semibold hover:brightness-110 transition"
          >
            Connect Wallet to Continue
          </button>
        ) : result ? (
          /* Success state */
          <div className="rounded-2xl border border-teal-500/30 bg-teal-500/5 p-6">
            <div className="text-3xl mb-3">🎉</div>
            <h2 className="text-xl font-bold mb-1">Event Created!</h2>
            <p className="text-sm text-gray-400 mb-4">
              PDA: <code className="text-xs text-teal-300">{result.eventPDA}</code>
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Blink URL (share this!)</label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={result.blinkUrl}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(result.blinkUrl)}
                    className="px-3 py-2 rounded-lg bg-purple-600 text-xs font-semibold hover:brightness-110 transition"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Preview on dial.to</label>
                <a
                  href={result.dialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-purple-400 hover:text-purple-300 underline"
                >
                  Open in dial.to →
                </a>
              </div>
            </div>

            <button
              onClick={() => { setResult(null); setName(""); setDescription(""); }}
              className="mt-6 w-full py-2 rounded-lg border border-white/10 text-sm hover:bg-white/5 transition"
            >
              Create Another Event
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Event Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                required
                placeholder="Solana Hacker House Lima"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 transition placeholder:text-gray-600"
              />
              <span className="text-[10px] text-gray-600">{name.length}/50</span>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                required
                rows={3}
                placeholder="3 days of hacking, workshops, and networking."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 transition placeholder:text-gray-600 resize-none"
              />
              <span className="text-[10px] text-gray-600">{description.length}/200</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Ticket Price (SOL)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={priceSol}
                  onChange={(e) => setPriceSol(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 transition"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Max Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="65535"
                  value={maxTickets}
                  onChange={(e) => setMaxTickets(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 transition bg-[#07070d]"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.icon} {t.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !name || !description}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-teal-500 font-semibold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Event..." : "Create Event & Get Blink URL"}
            </button>

            <p className="text-[10px] text-gray-600 text-center">
              Connected: {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)} · Devnet
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
