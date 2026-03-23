// Shared event type config for frontend (no server env needed)

export const EVENT_TYPES = [
  { value: 0, label: "Conference", icon: "🎪", gradient: "from-purple-600/20 to-purple-900/10", border: "border-purple-500/20", badge: "bg-purple-500/20 text-purple-300" },
  { value: 1, label: "DeSci", icon: "🔬", gradient: "from-blue-600/20 to-blue-900/10", border: "border-blue-500/20", badge: "bg-blue-500/20 text-blue-300" },
  { value: 2, label: "Art & Music", icon: "🎵", gradient: "from-pink-600/20 to-pink-900/10", border: "border-pink-500/20", badge: "bg-pink-500/20 text-pink-300" },
  { value: 3, label: "Community", icon: "👥", gradient: "from-teal-600/20 to-teal-900/10", border: "border-teal-500/20", badge: "bg-teal-500/20 text-teal-300" },
  { value: 4, label: "Other", icon: "🚀", gradient: "from-gray-600/20 to-gray-900/10", border: "border-gray-500/20", badge: "bg-gray-500/20 text-gray-300" },
] as const;

export function getEventType(n: number) {
  return EVENT_TYPES[n] ?? EVENT_TYPES[4];
}

export interface OnChainEvent {
  pda: string;
  authority: string;
  eventId: number;
  name: string;
  description: string;
  ticketPrice: number;
  maxTickets: number;
  ticketsSold: number;
  isActive: boolean;
  eventType: number;
  isDemoEvent?: boolean;
  city?: string;
  date?: string;
}
