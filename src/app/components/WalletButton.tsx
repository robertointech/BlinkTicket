"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export function WalletButton() {
  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();

  if (connected && publicKey) {
    const addr = publicKey.toBase58();
    return (
      <button
        onClick={() => disconnect()}
        className="text-sm font-medium px-4 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition"
        title={addr}
      >
        {addr.slice(0, 4)}...{addr.slice(-4)}
      </button>
    );
  }

  return (
    <button
      onClick={() => setVisible(true)}
      className="text-sm font-medium px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-teal-500 hover:brightness-110 transition"
    >
      Connect Wallet
    </button>
  );
}
