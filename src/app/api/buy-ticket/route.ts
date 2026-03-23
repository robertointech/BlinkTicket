import { NextResponse } from "next/server";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { getConnection, getProgramId, getRelayKeypair, getEventPDA, getTicketPDA } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { eventId, authority, buyerPubkey } = await request.json();

    if (!eventId || !authority || !buyerPubkey) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const buyer = new PublicKey(buyerPubkey);
    const authorityKey = new PublicKey(authority);
    const programId = getProgramId();
    const connection = getConnection();
    const relay = getRelayKeypair();

    const [eventPDA] = getEventPDA(authorityKey, Number(eventId));
    const [ticketPDA] = getTicketPDA(eventPDA, buyer);

    // Check if ticket already exists
    const existing = await connection.getAccountInfo(ticketPDA);
    if (existing) {
      return NextResponse.json({ error: "You already have a ticket for this event!" }, { status: 400 });
    }

    // buy_ticket discriminator (no args after audit)
    const data = Buffer.from([11, 24, 17, 193, 168, 116, 164, 169]);

    const keys = [
      { pubkey: eventPDA, isSigner: false, isWritable: true },
      { pubkey: ticketPDA, isSigner: false, isWritable: true },
      { pubkey: authorityKey, isSigner: false, isWritable: true },
      { pubkey: buyer, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ];

    const ix = new TransactionInstruction({ programId, keys, data });
    const transaction = new Transaction().add(ix);

    // Gasless: relay pays fee
    transaction.feePayer = relay.publicKey;
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    transaction.partialSign(relay);

    const serialized = transaction
      .serialize({ requireAllSignatures: false })
      .toString("base64");

    return NextResponse.json({ transaction: serialized });
  } catch (error) {
    console.error("Error building buy tx:", error);
    const message = error instanceof Error ? error.message : "Failed to create transaction";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
