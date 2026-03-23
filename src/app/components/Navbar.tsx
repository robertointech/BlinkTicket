"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "./WalletButton";

const NAV_LINKS = [
  { href: "/events", label: "Events" },
  { href: "/create", label: "Create" },
  { href: "/my-tickets", label: "My Tickets" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[#07070d]/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-5">
        <Link
          href="/"
          className="text-lg font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent"
        >
          BlinkTicket
        </Link>
        <nav className="flex items-center gap-1 sm:gap-4">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-lg transition ${
                pathname?.startsWith(l.href)
                  ? "text-white bg-white/5"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <WalletButton />
        </nav>
      </div>
    </header>
  );
}
