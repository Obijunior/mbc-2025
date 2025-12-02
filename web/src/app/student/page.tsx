// web/app/student/page.tsx
"use client";

import { useState } from "react";

export default function StudentPage() {
  const [isVerified] = useState(true); // mock
  const [remaining] = useState(150); // mock
  const [amount, setAmount] = useState("");

  const handleWithdrawClick = () => {
    console.log("Withdraw", amount);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Student emergency support
        </h1>
        <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
          If you&apos;ve been approved by your university, you can request small
          emergency payouts directly to your wallet.
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-slate-300">
              Eligibility status
            </p>
            <p className="text-sm">
              {isVerified ? (
                <span className="text-emerald-300">
                  ✅ You&apos;re verified for emergency aid.
                </span>
              ) : (
                <span className="text-amber-300">
                  ⏳ Your wallet hasn&apos;t been approved yet.
                </span>
              )}
            </p>
          </div>
          {isVerified && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-right text-xs">
              <p className="text-slate-200">Remaining allocation</p>
              <p className="text-lg font-semibold text-emerald-300">
                ${remaining.toFixed(2)} USDC
              </p>
            </div>
          )}
        </div>

        <div className="h-px bg-slate-800" />

        <div className="space-y-3 text-sm">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">
              Request amount (USDC)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 50.00"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/40 focus:border-sky-500 focus:ring-2"
              disabled={!isVerified}
            />
          </div>

          <button
            onClick={handleWithdrawClick}
            disabled={!isVerified || !amount}
            className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Request emergency funds
          </button>
        </div>
      </section>
    </div>
  );
}
