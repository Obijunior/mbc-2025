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
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Contract hooks
  const { data: usdcBalance, refetch: refetchBalance } = useUSDCBalance();
  const { data: allowance, isLoading: isAllowanceLoading, refetch: refetchAllowance } = useUSDCAllowance();
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setIsMounted(true);
    }, 100);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (approvalSuccess && txStep === 'approving') {
      refetchAllowance();
      setTxStep('donating');
      donate(selectedFund, amountInUnits);
    }
  }, [approvalSuccess, txStep, refetchAllowance, donate, selectedFund, amountInUnits]);

  useEffect(() => {
    if (donationSuccess && txStep === 'donating') {
      setTxStep('success');
      refetchBalance();
      refetchAllowance();
    }
  }, [donationSuccess, txStep, refetchBalance, refetchAllowance]);

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
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {isMounted && (
          <div
            className="absolute w-[500px] h-[500px] bg-sky-500/20 rounded-full blur-[120px] transition-all duration-1000 ease-out"
            style={{
              left: `${mousePosition.x - 250}px`,
              top: `${mousePosition.y - 250}px`,
            }}
          />
        )}
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1400ms' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(56, 189, 248, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.5) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        {/* Hero Section */}
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/5 px-4 py-2 backdrop-blur-sm hover:border-sky-500/40 hover:bg-sky-500/10 transition-all duration-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              <span className="text-xs font-semibold text-sky-300 tracking-[0.2em] uppercase">
                Donor Dashboard • USDC Donations
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              <span className="block text-white mb-2 drop-shadow-2xl">Support students</span>
              <span className="block bg-linear-to-r from-sky-400 via-sky-200 to-blue-400 bg-clip-text text-transparent animate-gradient drop-shadow-2xl">
                when it matters most
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
              Choose a university emergency fund, see its real-time balance, and contribute USDC directly onchain.
            </p>
          </div>
        </div>

        {/* USDC Balance Card */}
        {isConnected && (
          <div className={`mt-12 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative max-w-2xl mx-auto group">
              <div className="absolute inset-0 bg-linear-to-r from-sky-500/20 to-emerald-500/20 blur-2xl -z-10 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="rounded-2xl border border-sky-500/30 bg-slate-900/60 backdrop-blur-xl p-6 hover:border-sky-500/50 transition-all duration-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-sky-400 uppercase tracking-[0.15em] mb-1">Your USDC Balance</p>
                    <p className="text-4xl font-black text-white">
                      ${usdcBalance !== undefined ? formatUSDC(usdcBalance) : '0.00'}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 group-hover:bg-sky-500/20 transition-all duration-300">
                    <svg className="w-8 h-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className={`mt-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Fund Selection Card */}
            <div className="group/section relative">
              <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-transparent rounded-3xl blur-2xl opacity-0 group-hover/section:opacity-100 transition-all duration-700" />
              <div className="relative h-full rounded-3xl border border-slate-800/50 bg-slate-900/60 backdrop-blur-sm p-8 hover:border-purple-500/40 hover:bg-slate-900/80 transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 group-hover/section:bg-purple-500/20 group-hover/section:border-purple-500/40 transition-all duration-300">
                    <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-[0.2em]">Step 1</span>
                    <h2 className="text-xl font-bold text-white">Select University Fund</h2>
                  </div>
                </div>

                <div className="space-y-4">
                  {DEMO_UNIVERSITIES.map((fund) => (
                    <button
                      key={fund.id.toString()}
                      onClick={() => setSelectedFund(fund.id)}
                      className={`w-full rounded-2xl border p-5 text-left transition-all duration-300 group/card cursor-pointer hover:scale-[1.02] ${
                        selectedFund === fund.id
                          ? "border-sky-500/60 bg-sky-500/10 shadow-lg shadow-sky-500/20"
                          : "border-slate-800/50 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950/80"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl transition-all duration-300 ${
                            selectedFund === fund.id ? "bg-sky-500/20" : "bg-slate-800 group-hover/card:bg-slate-700"
                          }`}>
                            <svg className={`w-5 h-5 ${selectedFund === fund.id ? "text-sky-400" : "text-slate-400 group-hover/card:text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                          </div>
                          <div>
                            <span className={`font-bold ${selectedFund === fund.id ? "text-white" : "text-slate-200"}`}>
                              {fund.name}
                            </span>
                            <p className="text-xs text-slate-400 mt-0.5">{fund.description}</p>
                          </div>
                        </div>
                        {selectedFund === fund.id && (
                          <div className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                        )}
                      </div>
                      {universityData && selectedFund === fund.id && (
                        <div className="mt-4 pt-4 border-t border-slate-800/50">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-sm font-semibold text-emerald-400">
                              Pool Balance: ${formatUSDC(universityData[2])} USDC
                            </span>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Donation Form Card */}
            <div className="group/section relative">
              <div className="absolute inset-0 bg-linear-to-br from-sky-500/10 to-transparent rounded-3xl blur-2xl opacity-0 group-hover/section:opacity-100 transition-all duration-700" />
              <div className="relative h-full rounded-3xl border border-slate-800/50 bg-slate-900/60 backdrop-blur-sm p-8 hover:border-sky-500/40 hover:bg-slate-900/80 transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 group-hover/section:bg-sky-500/20 group-hover/section:border-sky-500/40 transition-all duration-300">
                    <svg className="w-7 h-7 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-[0.2em]">Step 2</span>
                    <h2 className="text-xl font-bold text-white">Donate USDC</h2>
                  </div>
                </div>

                {!isConnected ? (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/20">
                        <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-amber-200">
                        Please connect your wallet to donate.
                      </p>
                    </div>
                  </div>
                ) : txStep === 'success' ? (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-500/20">
                          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-emerald-200">Donation successful!</p>
                          <p className="text-sm text-emerald-300/80">Thank you for supporting students in need.</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={resetTransaction}
                      className="w-full rounded-xl bg-slate-800 px-6 py-4 font-bold text-white transition-all duration-300 hover:bg-slate-700 hover:scale-[1.02]"
                    >
                      Make Another Donation
                    </button>
                  </div>
                ) : txStep === 'error' ? (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-red-500/20">
                          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-red-200">Transaction failed</p>
                          <p className="text-sm text-red-300/80">{(approvalError || donationError)?.message || 'Unknown error'}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={resetTransaction}
                      className="w-full rounded-xl bg-slate-800 px-6 py-4 font-bold text-white transition-all duration-300 hover:bg-slate-700 hover:scale-[1.02]"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                      Donate USDC from your wallet directly into the <span className="font-semibold text-sky-300">{currentFund.name}</span> emergency fund.
                    </p>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">
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
                        className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-5 py-4 text-lg font-semibold text-white outline-none ring-sky-500/40 focus:border-sky-500 focus:ring-2 disabled:opacity-60 transition-all duration-300 placeholder:text-slate-600"
                      />
                      {amount && !hasEnoughBalance && (
                        <p className="text-sm text-red-400 font-medium">Insufficient USDC balance</p>
                      )}
                    </div>

                    {txStep !== 'idle' && (
                      <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
                          <p className="text-sm font-medium text-sky-200">
                            {txStep === 'approving' && 'Approving USDC...'}
                            {txStep === 'donating' && 'Processing donation...'}
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleDonateClick}
                      className="group/btn w-full inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-sky-500 to-sky-600 px-6 py-4 font-bold text-white shadow-lg shadow-sky-900/50 hover:shadow-sky-900/80 hover:scale-[1.02] transition-all duration-300 hover:from-sky-400 hover:to-sky-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                      disabled={!amount || isProcessing || !hasEnoughBalance || isAllowanceLoading}
                    >
                      {isProcessing ? (
                        'Processing...'
                      ) : needsApproval ? (
                        `Approve & Donate to ${currentFund.name}`
                      ) : (
                        `Donate to ${currentFund.name}`
                      )}
                      <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>

                    <p className="text-xs text-slate-500 text-center font-medium">
                      {needsApproval
                        ? 'First approval, then donation (2 transactions)'
                        : 'Single transaction required'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contract Info Footer */}
        <div className={`mt-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500">
                  Contract: <code className="text-slate-400 font-mono">{CAMPUS_SHIELD_ADDRESS}</code>
                </p>
                <p className="text-xs text-slate-500">
                  USDC: <code className="text-slate-400 font-mono">{USDC_ADDRESS}</code>
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-slate-400">Deployed on Base Sepolia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`mt-12 text-center transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-3 text-sm text-slate-400 hover:text-slate-300 transition-colors duration-300">
            <span className="flex h-2 w-2 rounded-full bg-slate-600" />
            <span className="font-medium">100% Transparent</span>
            <span className="text-slate-700">•</span>
            <span className="font-medium">Direct Transfers</span>
            <span className="text-slate-700">•</span>
            <span className="font-medium">Real Impact</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}