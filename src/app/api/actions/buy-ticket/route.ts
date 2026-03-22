import {
  ACTIONS_CORS_HEADERS,
  ActionGetResponse,
  ActionPostRequest,
  createPostResponse,
} from "@solana/actions";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  getConnection,
  getProgramId,
  getDemoEvent,
  getRelayKeypair,
  getEventPDA,
  getTicketPDA,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_ICONS,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

// GET - Returns Action metadata for the Blink with event_type badge
export async function GET() {
  const event = getDemoEvent();

  const typeLabel = EVENT_TYPE_LABELS[event.eventType] ?? "Event";
  const typeIcon = EVENT_TYPE_ICONS[event.eventType] ?? "🎫";

  const payload: ActionGetResponse = {
    type: "action",
    icon: event.imageUrl,
    title: `${typeIcon} ${event.name}`,
    description: [
      `[${typeLabel}]`,
      "",
      event.description,
      "",
      `💰 Price: ${event.ticketPriceSol} SOL`,
      `📍 Max capacity: ${event.maxTickets} attendees`,
      `⛽ Gasless — transaction fees covered`,
    ].join("\n"),
    label: `Buy Ticket (${event.ticketPriceSol} SOL)`,
    links: {
      actions: [
        {
          type: "transaction",
          label: `🎟️ Buy Ticket - ${event.ticketPriceSol} SOL (Gasless)`,
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

// POST - Build gasless buy_ticket transaction
// The relay keypair pays the transaction fee, buyer only signs for the purchase
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

    const connection = getConnection();
    const programId = getProgramId();
    const relayKeypair = getRelayKeypair();

    // Derive PDAs
    const authorityPubkey = new PublicKey(event.authority);
    const [eventPDA] = getEventPDA(authorityPubkey, event.eventId);
    const [ticketPDA] = getTicketPDA(eventPDA, buyerPubkey);

    // Anchor instruction discriminator: sha256("global:buy_ticket")[0..8]
    const discriminator = Buffer.from([
      11, 24, 17, 193, 168, 116, 164, 169,
    ]);

    // Encode loyalty_count arg (u8) — 0 for now, loyalty check can be added later
    const loyaltyCount = Buffer.from([0]);
    const data = Buffer.concat([discriminator, loyaltyCount]);

    const keys = [
      { pubkey: eventPDA, isSigner: false, isWritable: true },
      { pubkey: ticketPDA, isSigner: false, isWritable: true },
      { pubkey: authorityPubkey, isSigner: false, isWritable: true },
      { pubkey: buyerPubkey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ];

    const buyTicketIx = new TransactionInstruction({
      programId,
      keys,
      data,
    });

    const transaction = new Transaction().add(buyTicketIx);

    // GASLESS: relay keypair pays the transaction fee
    transaction.feePayer = relayKeypair.publicKey;
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    // Relay partially signs (fee payer), buyer will sign in their wallet
    transaction.partialSign(relayKeypair);

    const payload = await createPostResponse({
      fields: {
        type: "transaction",
        transaction,
        message: `🎫 Ticket purchased for "${event.name}"! Gas fees covered by BlinkTicket.`,
      },
    });

    return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
  } catch (error) {
    console.error("Error creating transaction:", error);
    const message = error instanceof Error ? error.message : "Failed to create transaction";
    return Response.json(
      { message },
      { status: 500, headers: ACTIONS_CORS_HEADERS }
    );
  }
}
