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

/** Extract event params from URL query or fall back to env defaults */
function getEventParams(url: URL) {
  const qEventId = url.searchParams.get("eventId");
  const qAuthority = url.searchParams.get("authority");

  if (qEventId && qAuthority) {
    return {
      eventId: Number(qEventId),
      authority: qAuthority,
      // For custom events, metadata comes from query or on-chain fetch
      name: url.searchParams.get("name") || `Event #${qEventId}`,
      description: url.searchParams.get("desc") || "Buy your ticket via Solana Blink",
      ticketPriceSol: Number(url.searchParams.get("price") || "0.05"),
      maxTickets: Number(url.searchParams.get("max") || "100"),
      imageUrl: url.searchParams.get("image") || `${url.origin}/blink-card.svg`,
      eventType: Number(url.searchParams.get("type") || "0"),
    };
  }

  return getDemoEvent();
}

// GET - Returns Action metadata for the Blink
export async function GET(request: Request) {
  const url = new URL(request.url);
  const event = getEventParams(url);

  const typeLabel = EVENT_TYPE_LABELS[event.eventType] ?? "Event";
  const typeIcon = EVENT_TYPE_ICONS[event.eventType] ?? "🎫";

  // Preserve query params in the action href
  const searchStr = url.search || "";

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
          href: `/api/actions/buy-ticket${searchStr}`,
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
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const event = getEventParams(url);
    const body: ActionPostRequest = await request.json();

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

    const authorityPubkey = new PublicKey(event.authority);
    const [eventPDA] = getEventPDA(authorityPubkey, event.eventId);
    const [ticketPDA] = getTicketPDA(eventPDA, buyerPubkey);

    // Check if ticket PDA already exists (user already bought)
    const existingTicket = await connection.getAccountInfo(ticketPDA);
    if (existingTicket) {
      return Response.json(
        { message: "You already have a ticket for this event!" },
        { status: 400, headers: ACTIONS_CORS_HEADERS }
      );
    }

    // Anchor discriminator for buy_ticket (no args after audit)
    const data = Buffer.from([
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
      programId,
      keys,
      data,
    });

    const transaction = new Transaction().add(buyTicketIx);

    // Gasless: relay pays tx fee
    transaction.feePayer = relayKeypair.publicKey;
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

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
