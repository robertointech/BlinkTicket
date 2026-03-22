# BlinkTicket - Buy event tickets from any link

> Event ticketing platform powered by **Solana Actions (Blinks)**. Share a link on Twitter, Discord, or Telegram and let your audience buy tickets with one click — no app downloads, no sign-ups.

**Solana LATAM Hackathon 2026** by WayLearn x Solana Foundation

**Categories:** Ticketing + Blinks

---

## Links

| Resource | URL |
|----------|-----|
| Landing Page | [blink-ticket.vercel.app](https://blink-ticket.vercel.app) |
| Blink Demo | [dial.to/?action=solana-action:https://blink-ticket.vercel.app/api/actions/buy-ticket](https://dial.to/?action=solana-action:https://blink-ticket.vercel.app/api/actions/buy-ticket) |
| Blink API (GET) | [blink-ticket.vercel.app/api/actions/buy-ticket](https://blink-ticket.vercel.app/api/actions/buy-ticket) |
| Program on Devnet | [explorer.solana.com/address/EFzK4HY7f8yr9qqsMJcPunCTwHF9cA69h265UR58bvj1?cluster=devnet](https://explorer.solana.com/address/EFzK4HY7f8yr9qqsMJcPunCTwHF9cA69h265UR58bvj1?cluster=devnet) |

**Program ID:** `EFzK4HY7f8yr9qqsMJcPunCTwHF9cA69h265UR58bvj1`

---

## How it works

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌──────────┐
│  Social Feed │     │  BlinkTicket API  │     │ Anchor Program  │     │  Solana  │
│  (Twitter,   │────>│  Next.js Route    │────>│ EventTickets    │────>│  Devnet  │
│   Discord)   │     │  /api/actions/    │     │ buy_ticket()    │     │          │
└──────────────┘     └──────────────────┘     └─────────────────┘     └──────────┘
       │                     │                        │
       │  1. User clicks     │  2. API builds tx      │  3. Program creates
       │     Blink link      │     with PDAs           │     ticket PDA &
       │                     │                        │     transfers SOL
       │                     │                        │
       │              ┌──────────────┐                │
       └─────────────>│ User Wallet  │────────────────┘
                      │ Signs & Send │
                      └──────────────┘
```

**Flow:**

1. **Share** — Event organizer creates an event on-chain and shares the Blink URL
2. **Buy** — User sees an interactive card in their feed, clicks "Buy Ticket"
3. **Sign** — Wallet pops up, user approves the transaction
4. **Attend** — A ticket PDA is minted to their wallet, verifiable on-chain

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Blink API | Solana Actions spec (`@solana/actions`) |
| Blockchain | Solana (Devnet), `@solana/web3.js` |
| Smart Contract | Anchor / Rust (`event_tickets` program) |
| Deployment | Vercel (serverless) |
| PDA Derivation | `[authority, "event", event_id]` for events, `[event, "ticket", buyer]` for tickets |

---

## Architecture

```
BlinkTicket/
├── public/
│   └── actions.json                          # Static actions discovery
├── src/
│   ├── app/
│   │   ├── .well-known/actions.json/
│   │   │   └── route.ts                      # Actions discovery with CORS
│   │   ├── api/actions/buy-ticket/
│   │   │   ├── route.ts                      # GET metadata + POST build tx + OPTIONS CORS
│   │   │   └── next-action/route.ts          # Post-purchase completion screen
│   │   ├── page.tsx                          # Landing page
│   │   ├── layout.tsx                        # Root layout + metadata
│   │   └── globals.css                       # Dark theme + gradients
│   └── lib/
│       ├── constants.ts                      # Lazy env config, PDA helpers, RPC connection
│       └── idl.ts                            # Anchor IDL types for EventTickets
├── .env.example                              # Required env vars template
├── tailwind.config.ts
└── package.json
```

---

## Run locally

```bash
# Clone
git clone https://github.com/robertointech/BlinkTicket.git
cd BlinkTicket

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your values:
#   SOLANA_RPC_URL=https://api.devnet.solana.com
#   PROGRAM_ID=EFzK4HY7f8yr9qqsMJcPunCTwHF9cA69h265UR58bvj1
#   EVENT_AUTHORITY=<your-event-creator-pubkey>
#   EVENT_ID=1
#   EVENT_NAME=My Event
#   EVENT_DESCRIPTION=Event description
#   EVENT_TICKET_PRICE_SOL=0.05
#   EVENT_MAX_TICKETS=100
#   EVENT_IMAGE_URL=https://example.com/image.png

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page.

Test the Blink API:
```bash
# GET metadata
curl http://localhost:3000/api/actions/buy-ticket

# POST to build a transaction
curl -X POST http://localhost:3000/api/actions/buy-ticket \
  -H "Content-Type: application/json" \
  -d '{"account": "<buyer-wallet-pubkey>"}'
```

Test on dial.to (requires public URL):
```
https://dial.to/?action=solana-action:https://blink-ticket.vercel.app/api/actions/buy-ticket
```

---

## Screenshots

### Landing Page
![Landing Page](https://blink-ticket.vercel.app/screenshots/landing.png)

### Blink Card (as seen on dial.to)
![Blink Card](https://blink-ticket.vercel.app/screenshots/blink.png)

---

## Smart Contract

The **EventTickets** Anchor program supports:

| Instruction | Description |
|-------------|-------------|
| `create_event` | Create event PDA with name, description, price, capacity |
| `buy_ticket` | Purchase ticket (creates ticket PDA, transfers SOL to organizer) |
| `cancel_ticket` | Cancel and close ticket PDA (refund rent) |
| `update_event` | Update event details (organizer only) |
| `close_event` | Close event and reclaim rent (organizer only, requires 0 tickets) |

PDA seeds:
- **Event:** `[authority, "event", event_id_le_bytes]`
- **Ticket:** `[event_pda, "ticket", buyer]`

---

## Author

Built by [@robertointech](https://github.com/robertointech) for the **Solana LATAM Hackathon 2026** by WayLearn x Solana Foundation.

---

## License

MIT
