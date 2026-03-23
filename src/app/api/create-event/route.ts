import { NextResponse } from "next/server";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { getConnection, getProgramId, getEventPDA } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, ticketPriceSol, maxTickets, eventType, authorityPubkey, eventId } = body;

    // Validate inputs
    if (!name || !description || !authorityPubkey || eventId === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (name.length > 50) {
      return NextResponse.json({ error: "Name max 50 characters" }, { status: 400 });
    }
    if (description.length > 200) {
      return NextResponse.json({ error: "Description max 200 characters" }, { status: 400 });
    }

    const authority = new PublicKey(authorityPubkey);
    const programId = getProgramId();
    const connection = getConnection();

    const [eventPDA] = getEventPDA(authority, eventId);

    // Build Anchor create_event instruction
    // Discriminator: sha256("global:create_event")[0..8]
    const crypto = await import("crypto");
    const discHash = crypto.createHash("sha256").update("global:create_event").digest();
    const discriminator = discHash.slice(0, 8);

    // Encode args: event_id (u64 LE), name (u32 len + bytes), description (u32 len + bytes),
    // ticket_price (u64 LE), max_tickets (u16 LE), event_type (u8)
    const eventIdBuf = Buffer.alloc(8);
    eventIdBuf.writeBigUInt64LE(BigInt(eventId));

    const nameBuf = Buffer.from(name, "utf8");
    const nameLenBuf = Buffer.alloc(4);
    nameLenBuf.writeUInt32LE(nameBuf.length);

    const descBuf = Buffer.from(description, "utf8");
    const descLenBuf = Buffer.alloc(4);
    descLenBuf.writeUInt32LE(descBuf.length);

    const priceLamports = Math.round((ticketPriceSol || 0.05) * LAMPORTS_PER_SOL);
    const priceBuf = Buffer.alloc(8);
    priceBuf.writeBigUInt64LE(BigInt(priceLamports));

    const maxTicketsBuf = Buffer.alloc(2);
    maxTicketsBuf.writeUInt16LE(maxTickets || 100);

    const eventTypeBuf = Buffer.from([eventType || 0]);

    const data = Buffer.concat([
      discriminator,
      eventIdBuf,
      nameLenBuf, nameBuf,
      descLenBuf, descBuf,
      priceBuf,
      maxTicketsBuf,
      eventTypeBuf,
    ]);

    const keys = [
      { pubkey: eventPDA, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ];

    const ix = new TransactionInstruction({ programId, keys, data });
    const transaction = new Transaction().add(ix);

    transaction.feePayer = authority;
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    const serialized = transaction
      .serialize({ requireAllSignatures: false })
      .toString("base64");

    // Build the Blink URL for sharing
    const baseUrl = request.headers.get("origin") || "https://blink-ticket.vercel.app";
    const blinkParams = new URLSearchParams({
      eventId: String(eventId),
      authority: authorityPubkey,
      name,
      desc: description,
      price: String(ticketPriceSol || 0.05),
      max: String(maxTickets || 100),
      type: String(eventType || 0),
    });
    const blinkUrl = `${baseUrl}/api/actions/buy-ticket?${blinkParams}`;
    const dialUrl = `https://dial.to/?action=solana-action:${encodeURIComponent(blinkUrl)}`;

    return NextResponse.json({
      transaction: serialized,
      eventPDA: eventPDA.toBase58(),
      blinkUrl,
      dialUrl,
    });
  } catch (error) {
    console.error("Error creating event transaction:", error);
    const message = error instanceof Error ? error.message : "Failed to create transaction";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
