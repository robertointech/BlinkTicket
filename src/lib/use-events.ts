"use client";

import { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { DEMO_EVENTS } from "./demo-events";
import type { OnChainEvent } from "./event-types";

const RPC = process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";
const PROGRAM_ID_STR = process.env.NEXT_PUBLIC_PROGRAM_ID || "EFzK4HY7f8yr9qqsMJcPunCTwHF9cA69h265UR58bvj1";
const EVENT_ACCOUNT_SIZE = 321;

function parseEventAccount(pubkey: PublicKey, data: Buffer): OnChainEvent | null {
  try {
    let offset = 8;

    const authority = new PublicKey(data.slice(offset, offset + 32)).toBase58();
    offset += 32;

    const eventId = Number(data.readBigUInt64LE(offset));
    offset += 8;

    const nameLen = data.readUInt32LE(offset);
    offset += 4;
    if (nameLen === 0 || nameLen > 50) return null;
    const name = data.slice(offset, offset + nameLen).toString("utf8");
    offset += nameLen;

    const descLen = data.readUInt32LE(offset);
    offset += 4;
    if (descLen > 200) return null;
    const description = data.slice(offset, offset + descLen).toString("utf8");
    offset += descLen;

    const ticketPrice = Number(data.readBigUInt64LE(offset));
    offset += 8;

    const maxTickets = data.readUInt16LE(offset);
    offset += 2;

    const ticketsSold = data.readUInt16LE(offset);
    offset += 2;

    const isActive = data[offset] === 1;
    offset += 1;

    const eventType = data[offset];

    return {
      pda: pubkey.toBase58(),
      authority,
      eventId,
      name,
      description,
      ticketPrice,
      maxTickets,
      ticketsSold,
      isActive,
      eventType,
      isDemoEvent: false,
    };
  } catch {
    return null;
  }
}

/** Get events stored in sessionStorage by /create page */
function getSessionEvents(): OnChainEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem("blinkticket_created_events");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Save a newly created event to sessionStorage */
export function saveCreatedEvent(ev: OnChainEvent) {
  if (typeof window === "undefined") return;
  const existing = getSessionEvents();
  // Avoid duplicates
  if (!existing.find((e) => e.eventId === ev.eventId && e.authority === ev.authority)) {
    existing.unshift(ev);
    sessionStorage.setItem("blinkticket_created_events", JSON.stringify(existing));
  }
}

/**
 * Client-side hook that:
 * 1. Immediately shows demo events + sessionStorage events
 * 2. Fetches on-chain events from RPC in background
 * 3. Merges on-chain first, then session, then demos
 */
export function useEvents() {
  const [events, setEvents] = useState<OnChainEvent[]>([...DEMO_EVENTS]);
  const [onChainLoaded, setOnChainLoaded] = useState(false);

  useEffect(() => {
    // Show session events immediately
    const sessionEvts = getSessionEvents();
    if (sessionEvts.length > 0) {
      setEvents([...sessionEvts, ...DEMO_EVENTS]);
    }

    // Fetch on-chain in background
    const fetchOnChain = async () => {
      try {
        const connection = new Connection(RPC, "confirmed");
        const programId = new PublicKey(PROGRAM_ID_STR);

        const accounts = await connection.getProgramAccounts(programId, {
          filters: [{ dataSize: EVENT_ACCOUNT_SIZE }],
        });

        const onChain: OnChainEvent[] = [];
        for (const a of accounts) {
          const ev = parseEventAccount(a.pubkey, a.account.data);
          if (ev) onChain.push(ev);
        }

        // Merge: on-chain first, then session (dedup), then demos
        const sessionEvts = getSessionEvents();
        const onChainPDAs = new Set(onChain.map((e) => `${e.authority}-${e.eventId}`));
        // Only keep session events that aren't already on-chain
        const uniqueSession = sessionEvts.filter(
          (e) => !onChainPDAs.has(`${e.authority}-${e.eventId}`)
        );

        setEvents([...onChain, ...uniqueSession, ...DEMO_EVENTS]);
      } catch (err) {
        console.error("[useEvents] RPC fetch failed:", err);
        // Keep demos + session events
      } finally {
        setOnChainLoaded(true);
      }
    };

    fetchOnChain();
  }, []);

  return { events, onChainLoaded };
}

/** Find a single event by slug (authority-eventId) from all sources */
export function findEventBySlug(events: OnChainEvent[], slug: string): OnChainEvent | undefined {
  return events.find(
    (e) => `${e.authority}-${e.eventId}` === slug || e.pda === slug
  );
}
