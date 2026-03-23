import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";

export const dynamic = "force-dynamic";

const RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const PROGRAM_ID = process.env.PROGRAM_ID || "EFzK4HY7f8yr9qqsMJcPunCTwHF9cA69h265UR58bvj1";

// Event account: 8 disc + 32 + 8 + (4+50) + (4+200) + 8 + 2 + 2 + 1 + 1 + 1 = 321
const EVENT_ACCOUNT_SIZE = 321;

export async function GET() {
  try {
    const connection = new Connection(RPC, "confirmed");
    const programId = new PublicKey(PROGRAM_ID);

    const accounts = await connection.getProgramAccounts(programId, {
      filters: [{ dataSize: EVENT_ACCOUNT_SIZE }],
    });

    const events = accounts.map((a) => {
      const data = a.account.data;
      let offset = 8; // skip discriminator

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
        pda: a.pubkey.toBase58(),
        authority,
        eventId,
        name,
        description,
        ticketPrice,
        maxTickets,
        ticketsSold,
        isActive,
        eventType,
      };
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json([], { status: 200 });
  }
}
