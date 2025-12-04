// web/app/donor/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { 
  useUSDCBalance, 
  useUSDCAllowance, 
  useApproveUSDC, 
  useDonate,
  useGetUniversity,
} from "@/hooks/useContract";
import { 
  formatUSDC, 
  parseUSDC, 
  CAMPUS_SHIELD_ADDRESS,
  USDC_ADDRESS 
} from "@/lib/contracts";

// For demo purposes, we'll use university ID 1
// In production, this would be fetched dynamically
const DEMO_UNIVERSITIES = [
  {
    id: 1n,
    name: "University of Kansas",
    description: "General student emergency support for KU undergrads.",
  },
  {
    id: 2n,
    name: "Kansas State University",
    description: "Supports housing and food insecurity emergencies.",
  },
];

export default function DonorPage() {
  const { isConnected } = useAccount();
  const [selectedFund, setSelectedFund] = useState(1n);
  const [amount, setAmount] = useState("");
  const [txStep, setTxStep] = useState<'idle' | 'approving' | 'donating' | 'success' | 'error'>('idle');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  
  // Contract hooks
  const { data: usdcBalance, refetch: refetchBalance } = useUSDCBalance();
  const { data: allowance, refetch: refetchAllowance } = useUSDCAllowance();
  const { data: universityData } = useGetUniversity(selectedFund);
  
  const { 
    approve, 
    isPending: isApproving, 
    isSuccess: approvalSuccess, 
    error: approvalError 
  } = useApproveUSDC();
  
  const { 
    donate, 
    isPending: isDonating, 
    isSuccess: donationSuccess, 
    error: donationError 
  } = useDonate();

  const currentFund = DEMO_UNIVERSITIES.find((f) => f.id === selectedFund)!;
  const amountInUnits = amount ? parseUSDC(amount) : 0n;
  const needsApproval = allowance !== undefined && amountInUnits > allowance;

  // Handle approval success -> proceed to donate
  useEffect(() => {
    if (approvalSuccess && txStep === 'approving') {
      refetchAllowance();
      setTxStep('donating');
      donate(selectedFund, amountInUnits);
    }
  }, [approvalSuccess, txStep, refetchAllowance, donate, selectedFund, amountInUnits]);

  // Handle donation success
  useEffect(() => {
    if (donationSuccess && txStep === 'donating') {
      setTxStep('success');
      refetchBalance();
      refetchAllowance();
    }
  }, [donationSuccess, txStep, refetchBalance, refetchAllowance]);

  // Handle errors
  useEffect(() => {
    if (approvalError || donationError) {
      setTxStep('error');
    }
  }, [approvalError, donationError]);

  const handleDonateClick = () => {
    if (!amount || amountInUnits === 0n) return;

    if (needsApproval) {
      setTxStep('approving');
      approve(amountInUnits);
    } else {
      setTxStep('donating');
      donate(selectedFund, amountInUnits);
    }
  };

  const resetTransaction = () => {
    setTxStep('idle');
    setAmount("");
  };

  const isProcessing = isApproving || isDonating;
  const hasEnoughBalance = usdcBalance !== undefined && amountInUnits <= usdcBalance;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Donor Dashboard
        </h1>
        <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
          Choose a university emergency fund on Base, see its overall health,
          and top it up with USDC.
        </p>
      </header>

      {/* USDC Balance Display */}
      {isConnected && (
        <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-sky-300">Your USDC Balance</p>
              <p className="text-2xl font-bold text-white">
                ${usdcBalance !== undefined ? formatUSDC(usdcBalance) : '0.00'}
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-sky-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">$</span>
                </div>
                <span className="text-sm font-medium text-sky-200">USDC</span>
              </div>
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500"
              >
                Purchase USDC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase USDC Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Purchase USDC</h3>
            <p className="text-sm text-slate-400 mb-4">
              Use an exchange or payment service to purchase USDC and transfer it to your wallet.
            </p>
            
            <div className="space-y-3 mb-6">
              <a
                href="https://www.circle.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-sky-300 transition hover:border-sky-500/50 hover:bg-slate-750"
              >
                Circle
              </a>
              <a
                href="https://www.coinbase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-sky-300 transition hover:border-sky-500/50 hover:bg-slate-750"
              >
                Coinbase
              </a>
              <a
                href="https://www.kraken.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-sky-300 transition hover:border-sky-500/50 hover:bg-slate-750"
              >
                Kraken
              </a>
            </div>

            <button
              onClick={() => setShowPurchaseModal(false)}
              className="w-full rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <section className="grid gap-6 md:grid-cols-[2fr,3fr]">
        {/* Fund Selection */}
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="text-sm font-semibold text-slate-100">
            1. Select a university fund
          </h2>
          <div className="space-y-3 text-sm">
            {DEMO_UNIVERSITIES.map((fund) => (
              <button
                key={fund.id.toString()}
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
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {fund.description}
                </p>
                {universityData && selectedFund === fund.id && (
                  <div className="mt-2 pt-2 border-t border-slate-800">
                    <p className="text-xs text-emerald-400">
                      Pool Balance: ${formatUSDC(universityData[2])} USDC
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Donation Form */}
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="text-sm font-semibold text-slate-100">
            2. Donate USDC
          </h2>
          
          {!isConnected ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="text-sm text-amber-200">
                Please connect your wallet to donate.
              </p>
            </div>
          ) : txStep === 'success' ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <p className="text-sm text-emerald-200 font-medium">
                  🎉 Donation successful!
                </p>
                <p className="text-xs text-emerald-300 mt-1">
                  Thank you for supporting students in need.
                </p>
              </div>
              <button
                onClick={resetTransaction}
                className="w-full rounded-xl bg-slate-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-600"
              >
                Make Another Donation
              </button>
            </div>
          ) : txStep === 'error' ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <p className="text-sm text-red-200 font-medium">
                  Transaction failed
                </p>
                <p className="text-xs text-red-300 mt-1">
                  {(approvalError || donationError)?.message || 'Unknown error'}
                </p>
              </div>
              <button
                onClick={resetTransaction}
                className="w-full rounded-xl bg-slate-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-600"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-400">
                Donate USDC from your wallet directly into the {currentFund.name} emergency fund.
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
                  disabled={isProcessing}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/40 focus:border-sky-500 focus:ring-2 disabled:opacity-60"
                />
                {amount && !hasEnoughBalance && (
                  <p className="text-xs text-red-400">Insufficient USDC balance</p>
                )}
              </div>

              {/* Transaction Status */}
              {txStep !== 'idle' && (
                <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
                    <p className="text-sm text-sky-200">
                      {txStep === 'approving' && 'Approving USDC...'}
                      {txStep === 'donating' && 'Processing donation...'}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={handleDonateClick}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-sky-500 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!amount || isProcessing || !hasEnoughBalance}
              >
                {isProcessing ? (
                  'Processing...'
                ) : needsApproval ? (
                  `Approve & Donate to ${currentFund.name}`
                ) : (
                  `Donate to ${currentFund.name}`
                )}
              </button>

              <p className="text-xs text-slate-500 text-center">
                {needsApproval 
                  ? 'First approval, then donation (2 transactions)' 
                  : 'Single transaction required'}
              </p>
            </>
          )}
        </div>
      </section>

      {/* Contract Info */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-500">
        <p>Contract: <code className="text-slate-400">{CAMPUS_SHIELD_ADDRESS}</code></p>
        <p>USDC: <code className="text-slate-400">{USDC_ADDRESS}</code></p>
        <p className="mt-1 text-slate-600">Deployed on Base Sepolia</p>
      </div>
    </div>
  );
}
