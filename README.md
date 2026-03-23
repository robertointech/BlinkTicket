# BlinkTicket - Buy event tickets from any link

> Universal funding platform powered by **Solana Actions (Blinks)**. Share a link on Twitter, Discord, or Telegram and let your audience buy tickets with one click — no app downloads, no sign-ups. Gasless transactions for buyers.

**Solana LATAM Hackathon 2026** by WayLearn x Solana Foundation

**Categories:** Ticketing + Blinks

---

## Links

| Resource | URL |
|----------|-----|
| Landing Page | [blink-ticket.vercel.app](https://blink-ticket.vercel.app) |
| Create Event | [blink-ticket.vercel.app/create](https://blink-ticket.vercel.app/create) |
| My Tickets | [blink-ticket.vercel.app/my-tickets](https://blink-ticket.vercel.app/my-tickets) |
| Blink Demo | [dial.to](https://dial.to/?action=solana-action:https://blink-ticket.vercel.app/api/actions/buy-ticket) |
| Blink API (GET) | [blink-ticket.vercel.app/api/actions/buy-ticket](https://blink-ticket.vercel.app/api/actions/buy-ticket) |
| Program on Devnet | [explorer.solana.com](https://explorer.solana.com/address/EFzK4HY7f8yr9qqsMJcPunCTwHF9cA69h265UR58bvj1?cluster=devnet) |
| Security Audit | [AUDIT.md](https://github.com/robertointech/EventTickets-Solana/blob/main/AUDIT.md) |

**Program ID:** `EFzK4HY7f8yr9qqsMJcPunCTwHF9cA69h265UR58bvj1`

---

## Features

- **5 Event Types**: Conference, Research/DeSci, Music/Art, Community/DAO, Open
- **Gasless Purchases**: Relay keypair pays tx fees, buyers only sign for the purchase
- **Wallet Connect**: Phantom + Solflare via `@solana/wallet-adapter`
- **Create Events On-chain**: `/create` page builds + signs `create_event` transactions
- **Dynamic Blink URLs**: Each event gets its own Blink URL with query params
- **My Tickets**: `/my-tickets` page queries PDAs on-chain to show user's tickets
- **On-chain Loyalty**: 3+ POAPs from same authority = 20% discount (verified on-chain, not spoofable)
- **Social Reviews**: Ticket holders can leave 1-5 star reviews with comments
- **POAP System**: Event authorities issue attendance records as PDAs
- **Security Audited**: All checked math, CEI pattern, no client-trusted inputs

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
       │     Blink link      │     (gasless relay)     │     ticket PDA &
       │                     │                        │     transfers SOL
       │              ┌──────────────┐                │
       └─────────────>│ User Wallet  │────────────────┘
                      │ Signs only   │
                      └──────────────┘
```

### Organizer Flow
1. Connect wallet at `/create`
2. Fill event form (name, description, price, capacity, type)
3. Sign transaction → event created on-chain
4. Get shareable Blink URL + dial.to preview link

### Buyer Flow
1. See Blink in social feed (Twitter, Discord, etc.)
2. Click "Buy Ticket" → wallet pops up
3. Sign → ticket PDA minted (gas fees covered by relay)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Wallet | `@solana/wallet-adapter` (Phantom, Solflare) |
| Blink API | Solana Actions spec (`@solana/actions`) |
| Blockchain | Solana (Devnet), `@solana/web3.js` |
| Smart Contract | Anchor / Rust (`event_tickets` program) |
| Deployment | Vercel (serverless) |

---

## Architecture

```
BlinkTicket/
├── public/actions.json
├── src/
│   ├── app/
│   │   ├── .well-known/actions.json/route.ts     # Actions discovery
│   │   ├── api/
│   │   │   ├── actions/buy-ticket/route.ts        # Blink GET/POST/OPTIONS (gasless)
│   │   │   └── create-event/route.ts              # Build create_event tx server-side
│   │   ├── components/WalletButton.tsx             # Connect/disconnect wallet
│   │   ├── create/page.tsx                         # Event creation form
│   │   ├── my-tickets/page.tsx                     # User's tickets list
│   │   ├── providers.tsx                           # Solana wallet providers
│   │   ├── page.tsx                                # Landing page
│   │   └── layout.tsx                              # Root layout with providers
│   └── lib/
│       ├── constants.ts                            # Env config, PDA helpers, relay keypair
│       └── idl.ts                                  # Anchor IDL types (v2, audited)
├── .env.example
└── package.json
```

---

## Run locally

```bash
git clone https://github.com/robertointech/BlinkTicket.git
cd BlinkTicket
npm install

cp .env.example .env.local
# Edit .env.local — see .env.example for all required variables
# Key vars: SOLANA_RPC_URL, PROGRAM_ID, EVENT_AUTHORITY, RELAY_PRIVATE_KEY

npm run dev
```

**Pages:**
- `http://localhost:3000` — Landing page
- `http://localhost:3000/create` — Create event (requires wallet)
- `http://localhost:3000/my-tickets` — View your tickets

**API:**
```bash
curl http://localhost:3000/api/actions/buy-ticket
curl http://localhost:3000/api/actions/buy-ticket?eventId=1&authority=<pubkey>
```

---

## Smart Contract (Audited)

| Instruction | Description |
|-------------|-------------|
| `create_event` | Create event with name, desc, price, capacity, event_type (0-4) |
| `buy_ticket` | Purchase ticket with on-chain loyalty verification via remaining_accounts |
| `issue_poap` | Authority issues AttendanceRecord PDA to attendee |
| `leave_review` | Ticket holder leaves 1-5 rating + 280 char comment |
| `cancel_ticket` | Cancel ticket, close PDA, decrement tickets_sold |
| `update_event` | Update event details (authority only) |
| `close_event` | Close event, reclaim rent (requires 0 tickets) |

**PDA Seeds:**
- Event: `[authority, "event", event_id_le_bytes]`
- Ticket: `[event_pda, "ticket", buyer]`
- POAP: `[attendee, "poap", event_pda]`
- Review: `[event_pda, "review", reviewer]`

**Security:** See [AUDIT.md](https://github.com/robertointech/EventTickets-Solana/blob/main/AUDIT.md) for full report.

---

## Author

Built by [@robertointech](https://github.com/robertointech) for the **Solana LATAM Hackathon 2026** by WayLearn x Solana Foundation.

## License

MIT
