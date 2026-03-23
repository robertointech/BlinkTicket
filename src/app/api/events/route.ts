import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { DEMO_EVENTS } from "@/lib/demo-events";

export const revalidate = 30; // cache for 30 seconds

const RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const PROGRAM_ID = process.env.PROGRAM_ID || "EFzK4HY7f8yr9qqsMJcPunCTwHF9cA69h265UR58bvj1";
const EVENT_ACCOUNT_SIZE = 321;
const RPC_TIMEOUT_MS = 8000;

function parseEvent(pubkey: PublicKey, data: Buffer) {
  let offset = 8;

  const authority = new PublicKey(data.slice(offset, offset + 32)).toBase58();
  offset += 32;

  const eventId = Number(data.readBigUInt64LE(offset));
  offset += 8;

  const nameLen = data.readUInt32LE(offset);
  offset += 4;
  const name = data.slice(offset, offset + nameLen).toString("utf8");
  offset += nameLen;

  const descLen = data.readUInt32LE(offset);
  offset += 4;
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
}

async function fetchOnChainEvents(): Promise<Array<Record<string, unknown>>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS);

  try {
    const connection = new Connection(RPC, {
      commitment: "confirmed",
      fetch: (url, options) => fetch(url, { ...options, signal: controller.signal }),
    });
    const programId = new PublicKey(PROGRAM_ID);

    const accounts = await connection.getProgramAccounts(programId, {
      filters: [{ dataSize: EVENT_ACCOUNT_SIZE }],
    });

    const events: Array<Record<string, unknown>> = [];
    for (const a of accounts) {
      try {
        const ev = parseEvent(a.pubkey, a.account.data);
        if (ev.name && ev.name.length > 0) {
          events.push(ev);
        }
      } catch (err) {
        console.error(`[events] Failed to parse account ${a.pubkey.toBase58()}:`, err);
      }
    }

    console.log(`[events] Fetched ${events.length} on-chain events`);
    return events;
  } catch (error: unknown) {
    const isTimeout = error instanceof DOMException && error.name === "AbortError";
    if (isTimeout) {
      console.error(`[events] RPC timeout after ${RPC_TIMEOUT_MS}ms — returning demos only`);
    } else {
      console.error(`[events] RPC error:`, error instanceof Error ? error.message : error);
    }
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  const onChainEvents = await fetchOnChainEvents();
  const allEvents = [...onChainEvents, ...DEMO_EVENTS];
  return NextResponse.json(allEvents);
}
