"use client";

import { useMemo, type ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";

// Workaround: wallet-adapter types export React 18 but Next.js 14 uses newer @types/react
// This is a known compatibility issue. The components work correctly at runtime.
const ConnProvider = ConnectionProvider as React.ComponentType<{ endpoint: string; children: ReactNode }>;
const WalProvider = WalletProvider as React.ComponentType<{ wallets: ReturnType<typeof useMemo>; autoConnect: boolean; children: ReactNode }>;
const ModalProvider = WalletModalProvider as React.ComponentType<{ children: ReactNode }>;

export function SolanaProviders({ children }: { children: ReactNode }) {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnProvider endpoint={RPC_URL}>
      <WalProvider wallets={wallets} autoConnect>
        <ModalProvider>{children}</ModalProvider>
      </WalProvider>
    </ConnProvider>
  );
}
