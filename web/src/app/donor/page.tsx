// web/app/donor/page.tsx
"use client";

import { useState } from "react";

const MOCK_FUNDS = [
  {
    id: "KU",
    name: "University of Kansas",
    // health: "Strong",
    description: "General student emergency support for KU undergrads.",
  },
  {
    id: "KSU",
    name: "Kansas State University",
    // health: "Medium",
    description: "Supports housing and food insecurity emergencies.",
  },
];

export default function DonorPage() {
  const [selectedFund, setSelectedFund] = useState(MOCK_FUNDS[0].id);
  const [amount, setAmount] = useState("");

  const currentFund = MOCK_FUNDS.find((f) => f.id === selectedFund)!;

  const handleDonateClick = () => {
    // later: call contract donate()
    console.log("Donate", amount, "to", selectedFund);
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Donor dashboard
        </h1>
        <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
          Choose a university emergency fund on Base, see its overall health,
          and top it up with USDC.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-[2fr,3fr]">
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="text-sm font-semibold text-slate-100">
            1. Select a university fund
          </h2>
          <div className="space-y-3 text-sm">
            {MOCK_FUNDS.map((fund) => (
              <button
                key={fund.id}
                onClick={() => setSelectedFund(fund.id)}
                className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                  selectedFund === fund.id
                    ? "border-sky-500/80 bg-slate-900"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-100">
                    {fund.name}
                  </span>
                  {/* <span className="text-xs text-slate-400">
                    {fund.health} fund
                  </span> */}
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {fund.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="text-sm font-semibold text-slate-100">
            2. Donate USDC
          </h2>
          <p className="text-xs text-slate-400">
            Once connected, you’ll approve and send USDC from your wallet
            directly into the {currentFund.name} emergency fund.
          </p>

          <div className="space-y-2 text-sm">
            <label className="text-xs font-medium text-slate-300">
              Amount (USDC)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 50.00"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/40 focus:border-sky-500 focus:ring-2"
            />
          </div>

          <button
            onClick={handleDonateClick}
            className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-sky-500 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!amount}
          >
            Donate to {currentFund.name}
          </button>
        </div>
      </section>
    </div>
  );
}
