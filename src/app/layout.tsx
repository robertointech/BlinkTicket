import type { Metadata } from "next";
import localFont from "next/font/local";
import dynamic from "next/dynamic";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const SolanaProviders = dynamic(
  () => import("./providers").then((mod) => mod.SolanaProviders),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "BlinkTicket | Event Tickets on Solana",
  description:
    "Buy event tickets instantly with Solana Blinks. No app needed, just one click from any social feed.",
  openGraph: {
    title: "BlinkTicket | Event Tickets on Solana",
    description:
      "Buy event tickets instantly with Solana Blinks. No app needed.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0f] min-h-screen`}
      >
        <SolanaProviders>{children}</SolanaProviders>
      </body>
    </html>
  );
}
