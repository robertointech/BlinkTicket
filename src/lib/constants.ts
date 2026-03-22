import { PublicKey } from "@solana/web3.js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const SOLANA_RPC = requireEnv("SOLANA_RPC_URL");
export const PROGRAM_PUBKEY = new PublicKey(requireEnv("PROGRAM_ID"));

export function getDemoEvent() {
  return {
    eventId: Number(requireEnv("EVENT_ID")),
    authority: requireEnv("EVENT_AUTHORITY"),
    name: requireEnv("EVENT_NAME"),
    description: requireEnv("EVENT_DESCRIPTION"),
    ticketPriceSol: Number(requireEnv("EVENT_TICKET_PRICE_SOL")),
    maxTickets: Number(requireEnv("EVENT_MAX_TICKETS")),
    imageUrl: requireEnv("EVENT_IMAGE_URL"),
  };
}

export function getEventPDA(authority: PublicKey, eventId: number): [PublicKey, number] {
  const eventIdBuffer = Buffer.alloc(8);
  eventIdBuffer.writeBigUInt64LE(BigInt(eventId));

  return PublicKey.findProgramAddressSync(
    [authority.toBuffer(), Buffer.from("event"), eventIdBuffer],
    PROGRAM_PUBKEY
  );
}

export function getTicketPDA(eventPDA: PublicKey, buyer: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [eventPDA.toBuffer(), Buffer.from("ticket"), buyer.toBuffer()],
    PROGRAM_PUBKEY
  );
}
