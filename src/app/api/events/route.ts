import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { DEMO_EVENTS } from "@/lib/demo-events";

export const dynamic = "force-dynamic";

const RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const PROGRAM_ID = process.env.PROGRAM_ID || "EFzK4HY7f8yr9qqsMJcPunCTwHF9cA69h265UR58bvj1";

// Event::SPACE = 8 + 32 + 8 + (4+50) + (4+200) + 8 + 2 + 2 + 1 + 1 + 1 = 321
const EVENT_ACCOUNT_SIZE = 321;

function parseEvent(pubkey: PublicKey, data: Buffer) {
  let offset = 8; // skip Anchor discriminator

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

export async function GET() {
  const onChainEvents: Array<Record<string, unknown>> = [];

  try {
    const connection = new Connection(RPC, "confirmed");
    const programId = new PublicKey(PROGRAM_ID);

    const accounts = await connection.getProgramAccounts(programId, {
      filters: [{ dataSize: EVENT_ACCOUNT_SIZE }],
    });

    for (const a of accounts) {
      try {
        const ev = parseEvent(a.pubkey, a.account.data);
        // Only include valid-looking events
        if (ev.name && ev.name.length > 0) {
          onChainEvents.push(ev);
        }
      } catch (err) {
        // Skip malformed accounts
        console.error("Failed to parse event account:", a.pubkey.toBase58(), err);
      }
    }
  } catch (error) {
    console.error("Error fetching on-chain events:", error);
  }

  // On-chain first, then demo fallback
  const allEvents = [...onChainEvents, ...DEMO_EVENTS];

  return NextResponse.json(allEvents);
}
