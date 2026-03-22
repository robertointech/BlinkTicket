import {
  ACTIONS_CORS_HEADERS,
  ActionGetResponse,
  ActionPostRequest,
  createPostResponse,
} from "@solana/actions";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { SOLANA_RPC, PROGRAM_PUBKEY, getDemoEvent, getEventPDA, getTicketPDA } from "@/lib/constants";

// GET - Returns Action metadata for the Blink
export async function GET() {
  const event = getDemoEvent();

  const payload: ActionGetResponse = {
    type: "action",
    icon: event.imageUrl,
    title: `🎫 ${event.name}`,
    description: `${event.description}\n\n💰 Price: ${event.ticketPriceSol} SOL\n📍 Max capacity: ${event.maxTickets} attendees`,
    label: `Buy Ticket (${event.ticketPriceSol} SOL)`,
    links: {
      actions: [
        {
          type: "transaction",
          label: `🎟️ Buy Ticket - ${event.ticketPriceSol} SOL`,
          href: `/api/actions/buy-ticket`,
        },
      ],
    },
  };

  return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
}

// OPTIONS - CORS preflight
export async function OPTIONS() {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS });
}

// POST - Build and return the buy_ticket transaction
export async function POST(request: Request) {
  try {
    const body: ActionPostRequest = await request.json();
    const event = getDemoEvent();

    let buyerPubkey: PublicKey;
    try {
      buyerPubkey = new PublicKey(body.account);
    } catch {
      return Response.json(
        { message: "Invalid account provided" },
        { status: 400, headers: ACTIONS_CORS_HEADERS }
      );
    }

    const connection = new Connection(SOLANA_RPC, "confirmed");

    // Derive PDAs
    const authorityPubkey = new PublicKey(event.authority);
    const [eventPDA] = getEventPDA(authorityPubkey, event.eventId);
    const [ticketPDA] = getTicketPDA(eventPDA, buyerPubkey);

    // Anchor instruction discriminator: sha256("global:buy_ticket")[0..8]
    const discriminator = Buffer.from([
      11, 24, 17, 193, 168, 116, 164, 169,
    ]);

    const keys = [
      { pubkey: eventPDA, isSigner: false, isWritable: true },
      { pubkey: ticketPDA, isSigner: false, isWritable: true },
      { pubkey: authorityPubkey, isSigner: false, isWritable: true },
      { pubkey: buyerPubkey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ];

    const buyTicketIx = new TransactionInstruction({
      programId: PROGRAM_PUBKEY,
      keys,
      data: discriminator,
    });

    const transaction = new Transaction().add(buyTicketIx);

    transaction.feePayer = buyerPubkey;
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    const payload = await createPostResponse({
      fields: {
        type: "transaction",
        transaction,
        message: `🎫 Ticket purchased for "${event.name}"! See you there!`,
      },
    });

    return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return Response.json(
      { message: "Failed to create transaction" },
      { status: 500, headers: ACTIONS_CORS_HEADERS }
    );
  }
}
