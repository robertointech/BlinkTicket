// Anchor IDL type for EventTickets program

export type EventTickets = {
  version: "0.1.0";
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
        { name: "maxTickets"; type: "u16" }
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
    }
  ];
};

export const IDL: EventTickets = {
  version: "0.1.0",
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
  ],
};
