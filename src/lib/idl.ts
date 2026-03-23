// Anchor IDL type for EventTickets program v2
// Includes: event_type, buy_ticket with loyalty, issue_poap, leave_review

export type EventTickets = {
  version: "0.2.0";
  name: "event_tickets";
  instructions: [
    {
      name: "createEvent";
      accounts: [
        { name: "event"; isMut: true; isSigner: false },
        { name: "authority"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [
        { name: "eventId"; type: "u64" },
        { name: "name"; type: "string" },
        { name: "description"; type: "string" },
        { name: "ticketPrice"; type: "u64" },
        { name: "maxTickets"; type: "u16" },
        { name: "eventType"; type: "u8" }
      ];
    },
    {
      name: "buyTicket";
      accounts: [
        { name: "event"; isMut: true; isSigner: false },
        { name: "ticket"; isMut: true; isSigner: false },
        { name: "eventAuthority"; isMut: true; isSigner: false },
        { name: "buyer"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [];
    },
    {
      name: "issuePoap";
      accounts: [
        { name: "event"; isMut: false; isSigner: false },
        { name: "attendanceRecord"; isMut: true; isSigner: false },
        { name: "attendee"; isMut: false; isSigner: false },
        { name: "authority"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [];
    },
    {
      name: "leaveReview";
      accounts: [
        { name: "event"; isMut: false; isSigner: false },
        { name: "ticket"; isMut: false; isSigner: false },
        { name: "review"; isMut: true; isSigner: false },
        { name: "reviewer"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [
        { name: "rating"; type: "u8" },
        { name: "comment"; type: "string" }
      ];
    }
  ];
  accounts: [
    {
      name: "Event";
      type: {
        kind: "struct";
        fields: [
          { name: "authority"; type: "publicKey" },
          { name: "eventId"; type: "u64" },
          { name: "name"; type: "string" },
          { name: "description"; type: "string" },
          { name: "ticketPrice"; type: "u64" },
          { name: "maxTickets"; type: "u16" },
          { name: "ticketsSold"; type: "u16" },
          { name: "isActive"; type: "bool" },
          { name: "eventType"; type: "u8" },
          { name: "bump"; type: "u8" }
        ];
      };
    },
    {
      name: "Ticket";
      type: {
        kind: "struct";
        fields: [
          { name: "event"; type: "publicKey" },
          { name: "owner"; type: "publicKey" },
          { name: "purchasePrice"; type: "u64" },
          { name: "isValid"; type: "bool" },
          { name: "bump"; type: "u8" }
        ];
      };
    },
    {
      name: "AttendanceRecord";
      type: {
        kind: "struct";
        fields: [
          { name: "event"; type: "publicKey" },
          { name: "attendee"; type: "publicKey" },
          { name: "authority"; type: "publicKey" },
          { name: "attendedAt"; type: "i64" },
          { name: "bump"; type: "u8" }
        ];
      };
    },
    {
      name: "Review";
      type: {
        kind: "struct";
        fields: [
          { name: "event"; type: "publicKey" },
          { name: "reviewer"; type: "publicKey" },
          { name: "rating"; type: "u8" },
          { name: "comment"; type: "string" },
          { name: "timestamp"; type: "i64" },
          { name: "bump"; type: "u8" }
        ];
      };
    }
  ];
};

export const IDL: EventTickets = {
  version: "0.2.0",
  name: "event_tickets",
  instructions: [
    {
      name: "createEvent",
      accounts: [
        { name: "event", isMut: true, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "eventId", type: "u64" },
        { name: "name", type: "string" },
        { name: "description", type: "string" },
        { name: "ticketPrice", type: "u64" },
        { name: "maxTickets", type: "u16" },
        { name: "eventType", type: "u8" },
      ],
    },
    {
      name: "buyTicket",
      accounts: [
        { name: "event", isMut: true, isSigner: false },
        { name: "ticket", isMut: true, isSigner: false },
        { name: "eventAuthority", isMut: true, isSigner: false },
        { name: "buyer", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: "issuePoap",
      accounts: [
        { name: "event", isMut: false, isSigner: false },
        { name: "attendanceRecord", isMut: true, isSigner: false },
        { name: "attendee", isMut: false, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: "leaveReview",
      accounts: [
        { name: "event", isMut: false, isSigner: false },
        { name: "ticket", isMut: false, isSigner: false },
        { name: "review", isMut: true, isSigner: false },
        { name: "reviewer", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "rating", type: "u8" },
        { name: "comment", type: "string" },
      ],
    },
  ],
  accounts: [
    {
      name: "Event",
      type: {
        kind: "struct",
        fields: [
          { name: "authority", type: "publicKey" },
          { name: "eventId", type: "u64" },
          { name: "name", type: "string" },
          { name: "description", type: "string" },
          { name: "ticketPrice", type: "u64" },
          { name: "maxTickets", type: "u16" },
          { name: "ticketsSold", type: "u16" },
          { name: "isActive", type: "bool" },
          { name: "eventType", type: "u8" },
          { name: "bump", type: "u8" },
        ],
      },
    },
    {
      name: "Ticket",
      type: {
        kind: "struct",
        fields: [
          { name: "event", type: "publicKey" },
          { name: "owner", type: "publicKey" },
          { name: "purchasePrice", type: "u64" },
          { name: "isValid", type: "bool" },
          { name: "bump", type: "u8" },
        ],
      },
    },
    {
      name: "AttendanceRecord",
      type: {
        kind: "struct",
        fields: [
          { name: "event", type: "publicKey" },
          { name: "attendee", type: "publicKey" },
          { name: "authority", type: "publicKey" },
          { name: "attendedAt", type: "i64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
    {
      name: "Review",
      type: {
        kind: "struct",
        fields: [
          { name: "event", type: "publicKey" },
          { name: "reviewer", type: "publicKey" },
          { name: "rating", type: "u8" },
          { name: "comment", type: "string" },
          { name: "timestamp", type: "i64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
  ],
};
