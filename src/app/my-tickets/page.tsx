"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Connection, PublicKey } from "@solana/web3.js";
import Link from "next/link";
import { Navbar } from "../components/Navbar";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";

interface TicketInfo {
  pubkey: string;
  event: string;
  purchasePrice: number;
  isValid: boolean;
}

export default function MyTicketsPage() {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [tickets, setTickets] = useState<TicketInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) return;

    const fetchTickets = async () => {
      setLoading(true);
      try {
        const connection = new Connection(RPC_URL, "confirmed");
        const programIdStr = process.env.NEXT_PUBLIC_PROGRAM_ID || "EFzK4HY7f8yr9qqsMJcPunCTwHF9cA69h265UR58bvj1";
        const programId = new PublicKey(programIdStr);

        // Fetch all program accounts that match Ticket structure
        // Ticket: 8 (disc) + 32 (event) + 32 (owner) + 8 (price) + 1 (valid) + 1 (bump) = 82
        const accounts = await connection.getProgramAccounts(programId, {
          filters: [
            { dataSize: 82 },
            // Filter by owner (bytes 40-72 = owner pubkey, offset 8+32=40)
            { memcmp: { offset: 40, bytes: publicKey.toBase58() } },
          ],
        });

        const parsed: TicketInfo[] = accounts.map((a) => {
          const data = a.account.data;
          const event = new PublicKey(data.slice(8, 40)).toBase58();
          const price = Number(data.readBigUInt64LE(72));
          const isValid = data[80] === 1;

          return {
            pubkey: a.pubkey.toBase58(),
            event,
            purchasePrice: price,
            isValid,
          };
        });

        setTickets(parsed);
      } catch (err) {
        console.error("Error fetching tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [publicKey]);

  return (
    <div className="min-h-screen bg-[#07070d] text-gray-100">
      <Navbar />

      <div className="max-w-2xl mx-auto px-5 py-16">
        <h1 className="text-3xl font-bold mb-2">
          My <span className="bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">Tickets</span>
        </h1>
        <p className="text-gray-500 mb-8">
          Tickets stored as PDAs in your wallet on Devnet.
        </p>

        {!connected ? (
          <button
            onClick={() => setVisible(true)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-teal-500 font-semibold hover:brightness-110 transition"
          >
            Connect Wallet to View Tickets
          </button>
        ) : loading ? (
          <div className="text-center py-12 text-gray-500">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🎫</div>
            <p className="text-gray-500 mb-4">No tickets found for this wallet.</p>
            <Link
              href="/"
              className="inline-block px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-teal-500 text-sm font-semibold hover:brightness-110 transition"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <div
                key={t.pubkey}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex items-center justify-between hover:bg-white/[0.04] transition"
              >
                <div>
                  <p className="text-xs text-gray-500 font-mono mb-1">
                    Event: {t.event.slice(0, 8)}...{t.event.slice(-4)}
                  </p>
                  <p className="text-sm font-semibold">
                    {(t.purchasePrice / 1_000_000_000).toFixed(4)} SOL
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      t.isValid
                        ? "bg-teal-500/20 text-teal-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {t.isValid ? "Valid" : "Cancelled"}
                  </span>
                  <a
                    href={`https://explorer.solana.com/address/${t.pubkey}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-gray-600 hover:text-gray-400"
                  >
                    ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
