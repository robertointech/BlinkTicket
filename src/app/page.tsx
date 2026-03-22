export default function Home() {
  const steps = [
    {
      num: "1",
      title: "Share",
      desc: "Create your event on-chain and get a Blink URL. Paste it on Twitter, Discord, Telegram, or anywhere.",
    },
    {
      num: "2",
      title: "Buy",
      desc: "Your audience sees an interactive card right in their feed. One tap to purchase with their Solana wallet.",
    },
    {
      num: "3",
      title: "Attend",
      desc: "The ticket lives as a PDA in their wallet. Show it at the door. Verifiable, transferable, on-chain.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#07070d] text-gray-100">
      {/* ── Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#07070d]/70 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-5">
          <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
            BlinkTicket
          </span>
          <nav className="flex items-center gap-5">
            <a href="#steps" className="text-sm text-gray-400 hover:text-white transition hidden sm:inline">
              How it works
            </a>
            <a href="#demo" className="text-sm text-gray-400 hover:text-white transition hidden sm:inline">
              Demo
            </a>
            <button className="text-sm font-medium px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-teal-500 hover:brightness-110 transition">
              Connect Wallet
            </button>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-24 px-5 overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-purple-700/15 blur-[160px]" />
        <div className="pointer-events-none absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-teal-600/10 blur-[140px]" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-block mb-6 px-3 py-1 rounded-full border border-purple-500/25 bg-purple-500/10 text-purple-300 text-xs tracking-wide uppercase">
            Solana Actions &middot; Devnet
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.08] tracking-tight">
            <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-teal-400 bg-clip-text text-transparent">
              BlinkTicket
            </span>
          </h1>

          <p className="mt-5 text-xl sm:text-2xl text-gray-400 max-w-xl mx-auto leading-relaxed">
            Buy event tickets from any link.
            <br className="hidden sm:block" />
            No apps. No sign-ups. Just one click.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#demo"
              className="inline-flex items-center justify-center px-7 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-violet-600 hover:brightness-110 transition shadow-lg shadow-purple-600/20"
            >
              Try the Demo
            </a>
            <a
              href="#steps"
              className="inline-flex items-center justify-center px-7 py-3 rounded-xl font-semibold border border-white/10 hover:bg-white/5 transition"
            >
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* ── Steps: Share → Buy → Attend ── */}
      <section id="steps" className="py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">
            Three steps.{" "}
            <span className="bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
              Zero friction.
            </span>
          </h2>
          <p className="text-gray-500 text-center mb-14 max-w-md mx-auto">
            From social feed to event ticket in seconds.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div
                key={s.num}
                className="relative rounded-2xl border border-white/5 bg-white/[0.02] p-7 hover:border-purple-500/20 hover:bg-white/[0.04] transition-all group"
              >
                {/* Step number */}
                <div className="mb-4 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-600/30 to-teal-600/30 text-sm font-bold text-purple-300 group-hover:from-purple-600/50 group-hover:to-teal-600/50 transition">
                  {s.num}
                </div>
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Connector arrows (desktop) */}
          <div className="hidden md:flex justify-center gap-4 mt-8 text-gray-600 text-2xl tracking-[0.5em]">
            Share &rarr; Buy &rarr; Attend
          </div>
        </div>
      </section>

      {/* ── Blink Demo ── */}
      <section id="demo" className="py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">
            See it in{" "}
            <span className="bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
              action
            </span>
          </h2>
          <p className="text-gray-500 text-center mb-14 max-w-lg mx-auto">
            This is what users see when your Blink link is shared. An interactive card, right in their feed.
          </p>

          <div className="max-w-sm mx-auto">
            {/* Blink card mock */}
            <div className="rounded-2xl border border-white/10 bg-[#111118] overflow-hidden shadow-2xl shadow-purple-900/10">
              {/* Image area */}
              <div className="relative h-48 bg-gradient-to-br from-purple-900/60 via-violet-900/40 to-teal-900/60 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl mb-2">🎫</div>
                  <div className="text-xs text-purple-300/70 font-mono">SOLANA BLINK</div>
                </div>
                {/* Corner badge */}
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[10px] font-semibold uppercase tracking-wider">
                  Devnet
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="text-[11px] text-gray-500 mb-1.5 font-mono">blinkticket.app</p>
                <h3 className="font-bold text-base mb-1">Solana Hacker House Lima 2026</h3>
                <p className="text-xs text-gray-400 mb-1.5 leading-relaxed">
                  The biggest Solana builder event in LATAM. 3 days of hacking, workshops, and networking.
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                  <span>0.05 SOL</span>
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                  <span>73 / 100 remaining</span>
                </div>

                {/* Buy button */}
                <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-teal-500 font-semibold text-sm hover:brightness-110 transition shadow-lg shadow-purple-600/15">
                  Buy Ticket &mdash; 0.05 SOL
                </button>
              </div>
            </div>

            {/* Caption */}
            <p className="text-center text-xs text-gray-600 mt-4">
              Powered by Solana Actions &middot; Program ID on Devnet
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-t border-b border-white/5 py-14 px-5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            ["< 0.001 SOL", "Tx Fee"],
            ["~400ms", "Confirmation"],
            ["100%", "On-chain"],
            ["0", "Middlemen"],
          ].map(([value, label]) => (
            <div key={label}>
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
                {value}
              </div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
            BlinkTicket
          </span>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-300 transition">GitHub</a>
            <a href="#" className="hover:text-gray-300 transition">Twitter</a>
            <a href="#" className="hover:text-gray-300 transition">Docs</a>
            <span className="text-gray-700">Solana Hackathon 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
