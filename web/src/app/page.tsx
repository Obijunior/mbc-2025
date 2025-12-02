// web/app/page.tsx
"use client";

import Link from "next/link";

const cards = [
  {
    title: "Donors",
    description:
      "Top up a university’s emergency safety net with USDC on Base and see the fund’s overall health.",
    href: "/donor",
  },
  {
    title: "Students",
    description:
      "If you’ve been approved, request small emergency payouts directly to your wallet with clear limits.",
    href: "/student",
  },
  {
    title: "Admins",
    description:
      "Create and oversee university funds, approve student wallets, and monitor usage at a glance.",
    href: "/admin",
  },
];

export default function Home() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 py-8">
      <section className="grid gap-6 md:grid-cols-[2fr,3fr]">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Onchain emergency funds for{" "}
            <span className="text-sky-300">real students</span>.
          </h1>
          <p className="max-w-xl text-sm text-slate-300 sm:text-base">
            CampusShield is a transparent emergency aid fund for universities
            built on Base and powered by USDC. Donors contribute to a shared
            pool; eligible students can access small, fast payouts when they
            need it most.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-slate-400 sm:text-sm">
            <span className="rounded-full bg-slate-800/80 px-3 py-1">
              🔵 Built on Base
            </span>
            <span className="rounded-full bg-slate-800/80 px-3 py-1">
              💵 Powered by USDC
            </span>
            <span className="rounded-full bg-slate-800/80 px-3 py-1">
              🎓 Student-first design
            </span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm shadow-sm transition hover:-translate-y-1 hover:border-sky-500/60 hover:shadow-sky-900/40 md:col-span-1"
            >
              <div className="mb-3 text-xs font-semibold text-slate-200">
                {card.title}
              </div>
              <p className="text-slate-300">{card.description}</p>
              <span className="mt-3 text-xs font-medium text-sky-300 group-hover:underline">
                Enter {card.title.toLowerCase()} view →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
