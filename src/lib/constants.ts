import { Connection, Keypair, PublicKey } from "@solana/web3.js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

export function getConnection(): Connection {
  return new Connection(requireEnv("SOLANA_RPC_URL"), "confirmed");
}

export function getProgramId(): PublicKey {
  return new PublicKey(requireEnv("PROGRAM_ID"));
}

export function getRelayKeypair(): Keypair {
  const secret = requireEnv("RELAY_PRIVATE_KEY");
  const bytes = JSON.parse(secret) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(bytes));
}

export const EVENT_TYPE_LABELS: Record<number, string> = {
  0: "Conference / Meetup",
  1: "Research Grant / DeSci",
  2: "Music & Art Release",
  3: "Community / DAO Project",
  4: "Open / Other",
};

export const EVENT_TYPE_ICONS: Record<number, string> = {
  0: "🎪",
  1: "🔬",
  2: "🎵",
  3: "👥",
  4: "🚀",
};

export function getDemoEvent() {
  return {
    eventId: Number(requireEnv("EVENT_ID")),
    authority: requireEnv("EVENT_AUTHORITY"),
    name: requireEnv("EVENT_NAME"),
    description: requireEnv("EVENT_DESCRIPTION"),
    ticketPriceSol: Number(requireEnv("EVENT_TICKET_PRICE_SOL")),
    maxTickets: Number(requireEnv("EVENT_MAX_TICKETS")),
    imageUrl: requireEnv("EVENT_IMAGE_URL"),
    eventType: Number(process.env.EVENT_TYPE?.trim() ?? "0"),
  };
}

export function getEventPDA(authority: PublicKey, eventId: number): [PublicKey, number] {
  const eventIdBuffer = Buffer.alloc(8);
  eventIdBuffer.writeBigUInt64LE(BigInt(eventId));

  return PublicKey.findProgramAddressSync(
    [authority.toBuffer(), Buffer.from("event"), eventIdBuffer],
    getProgramId()
  );
}

export function getTicketPDA(eventPDA: PublicKey, buyer: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [eventPDA.toBuffer(), Buffer.from("ticket"), buyer.toBuffer()],
    getProgramId()
  );
}
