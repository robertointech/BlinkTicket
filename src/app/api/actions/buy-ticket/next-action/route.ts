import { ACTIONS_CORS_HEADERS } from "@solana/actions";
import { NextAction } from "@solana/actions-spec";

// Completed action shown after successful ticket purchase
export async function POST() {
  const payload: NextAction = {
    type: "completed",
    icon: "https://ucarecdn.com/7aa46c85-08a4-4bc7-9376-a3b813a779d0/-/preview/880x864/-/quality/smart/-/format/auto/",
    title: "Ticket Purchased!",
    description:
      "Your ticket has been minted on-chain. Show your wallet at the door. See you at the event!",
    label: "Done",
  };

  return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
}

export async function OPTIONS() {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS });
}
