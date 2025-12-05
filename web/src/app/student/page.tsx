"use client";

import { useState, useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import {
  useGetStudentRequests,
  useRequestAid,
  useUSDCBalance,
  useGetUniversity,
} from "@/hooks/useContract";
import { formatUSDC, parseUSDC, type AidRequest } from "@/lib/contracts";

// Demo universities - in production, these would be fetched from the contract
const UNIVERSITIES = [
  { id: 1, name: "University of Kansas" },
  { id: 2, name: "Kansas State University" },
];

export default function StudentPage() {
  const { isConnected } = useAccount();
  const [selectedUniversity, setSelectedUniversity] = useState(1n);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [shouldPoll, setShouldPoll] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Contract hooks
  const { data: studentRequests, refetch: refetchRequests } = useGetStudentRequests();
  const { data: universityData, refetch: refetchUniversity, error: universityError } = useGetUniversity(selectedUniversity);
  const { data: usdcBalance } = useUSDCBalance();

  const {
    requestAid,
    isPending,
    isConfirming,
    isSuccess,
    error,
  } = useRequestAid();

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle transaction status
  useEffect(() => {
    if (isPending || isConfirming) setTxStatus('pending');
  }, [isPending, isConfirming]);

  // Start polling after successful transaction
  useEffect(() => {
    if (isSuccess && !shouldPoll) {
      setTxStatus('success');
      setAmount("");
      setReason("");
      setShouldPoll(true);
    }
  }, [isSuccess, shouldPoll]);

  // Poll for updates after transaction
  useEffect(() => {
    if (shouldPoll) {
      let pollCount = 0;
      const maxPolls = 10;
      
      const pollInterval = setInterval(async () => {
        pollCount++;
        await refetchRequests();
        refetchUniversity();
        
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          setShouldPoll(false);
        }
      }, 1000);
      
      return () => {
        clearInterval(pollInterval);
      };
    }
  }, [shouldPoll, refetchRequests, refetchUniversity]);

  useEffect(() => {
    if (error) setTxStatus('error');
  }, [error]);

  const handleRequestAid = () => {
    if (!amount || !reason) return;
    const amountInUnits = parseUSDC(amount);
    requestAid(selectedUniversity, amountInUnits, reason);
  };

  const resetForm = () => {
    setTxStatus('idle');
    setShouldPoll(false);
    setAmount("");
    setReason("");
  };

  // Calculate stats from student requests
  const pendingRequests = useMemo(() => 
    (studentRequests as AidRequest[] | undefined)?.filter(r => !r.isProcessed) || [],
    [studentRequests]
  );
  const approvedRequests = useMemo(() => 
    (studentRequests as AidRequest[] | undefined)?.filter(r => r.isApproved) || [],
    [studentRequests]
  );
  const totalReceived = useMemo(() => 
    approvedRequests.reduce((sum, r) => sum + r.amount, 0n),
    [approvedRequests]
  );

  const universityBalance = universityData ? universityData[2] : 0n;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.5) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-16 sm:px-8">
        {/* Header */}
        <header className={`space-y-4 mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-300 tracking-[0.2em] uppercase">
              Student Portal
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            Emergency Support
          </h1>
          
          <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
            Request emergency funds directly to your wallet. Funds are distributed in USDC on Base for instant, transparent relief.
          </p>
        </header>

        {/* Connection Status */}
        {!isConnected ? (
          <div className={`rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm p-6 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 flex-shrink-0">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-amber-200">
                Please connect your wallet to request emergency aid.
              </p>
            </div>
          </div>
        ) : universityError ? (
          <div className={`rounded-2xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm p-6 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-red-500/20 flex-shrink-0">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-red-200">
                  No universities registered yet
                </p>
                <p className="text-sm text-red-300/80 mt-1">
                  A university administrator needs to register their institution first before students can request aid.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Student Stats */}
            <section className={`grid grid-cols-2 gap-4 sm:grid-cols-3 mb-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="group relative rounded-2xl border border-slate-800/50 bg-slate-900/60 backdrop-blur-sm p-6 hover:border-slate-700 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">USDC Balance</p>
                  <p className="text-2xl font-black text-white">
                    ${usdcBalance !== undefined ? formatUSDC(usdcBalance) : '0.00'}
                  </p>
                </div>
              </div>
              
              <div className="group relative rounded-2xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm p-6 hover:border-emerald-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Total Received</p>
                  <p className="text-2xl font-black text-emerald-300">
                    ${formatUSDC(totalReceived)}
                  </p>
                </div>
              </div>
              
              <div className="group relative rounded-2xl border border-sky-500/30 bg-sky-500/10 backdrop-blur-sm p-6 col-span-2 sm:col-span-1 hover:border-sky-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <p className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">Pending Requests</p>
                  <p className="text-2xl font-black text-sky-300">
                    {pendingRequests.length}
                  </p>
                </div>
              </div>
            </section>

            {/* Request Form */}
            <section className={`rounded-3xl border border-slate-800/50 bg-slate-900/60 backdrop-blur-sm p-8 mb-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">
                  Request Emergency Aid
                </h2>
              </div>

              {txStatus === 'success' ? (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-emerald-500/20 flex-shrink-0">
                        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-emerald-200">Request submitted successfully!</p>
                        <p className="text-sm text-emerald-300/80 mt-1">
                          Your request is now pending review by the university admin.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={resetForm}
                    className="w-full rounded-xl bg-slate-800 px-6 py-4 font-bold text-white transition-all duration-300 hover:bg-slate-700 hover:scale-[1.02]"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : txStatus === 'error' ? (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-red-500/20 flex-shrink-0">
                        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-red-200">Transaction failed</p>
                        <p className="text-sm text-red-300/80 mt-1">
                          {error?.message || 'Unknown error'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={resetForm}
                    className="w-full rounded-xl bg-slate-800 px-6 py-4 font-bold text-white transition-all duration-300 hover:bg-slate-700 hover:scale-[1.02]"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* University Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-300 uppercase tracking-wider block">
                      University
                    </label>
                    <select
                      value={selectedUniversity.toString()}
                      onChange={(e) => setSelectedUniversity(BigInt(e.target.value))}
                      disabled={isPending}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-5 py-4 text-base font-semibold text-white outline-none ring-sky-500/40 focus:border-sky-500 focus:ring-2 disabled:opacity-60 transition-all duration-300"
                    >
                      {UNIVERSITIES.map((uni) => (
                        <option key={uni.id.toString()} value={uni.id.toString()}>
                          {uni.name}
                        </option>
                      ))}
                    </select>
                    {universityData && (
                      <p className="text-sm text-slate-500 font-medium">
                        Fund balance: ${formatUSDC(universityBalance)} USDC
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-300 uppercase tracking-wider block">
                      Request Amount (USDC)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="250"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g., 50.00"
                      disabled={isPending}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-5 py-4 text-lg font-semibold text-white outline-none ring-sky-500/40 focus:border-sky-500 focus:ring-2 disabled:opacity-60 transition-all duration-300 placeholder:text-slate-600"
                    />
                    <p className="text-sm text-slate-500 font-medium">Maximum: $250 USDC per request</p>
                  </div>

                  {/* Reason */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-300 uppercase tracking-wider block">
                      Reason for Request
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Briefly describe your emergency situation..."
                      disabled={isPending}
                      rows={4}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-5 py-4 text-base text-white outline-none ring-sky-500/40 focus:border-sky-500 focus:ring-2 disabled:opacity-60 resize-none transition-all duration-300 placeholder:text-slate-600"
                    />
                  </div>

                  {/* Transaction Status */}
                  {txStatus === 'pending' && (
                    <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-sky-400 border-t-transparent flex-shrink-0" />
                        <p className="text-sm font-medium text-sky-200">
                          {isPending ? 'Submitting request...' : isConfirming ? 'Confirming transaction...' : 'Processing...'}
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleRequestAid}
                    disabled={!amount || !reason || isPending || isConfirming}
                    className="group/btn w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 font-bold text-white shadow-lg shadow-emerald-900/50 hover:shadow-emerald-900/80 hover:scale-[1.02] transition-all duration-300 hover:from-emerald-400 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {isPending ? 'Submitting...' : isConfirming ? 'Confirming...' : 'Submit Request'}
                    <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              )}
            </section>

            {/* Request History */}
            {studentRequests && (studentRequests as AidRequest[]).length > 0 && (
              <section className={`rounded-3xl border border-slate-800/50 bg-slate-900/60 backdrop-blur-sm p-8 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-2xl bg-slate-700/50 border border-slate-600/50">
                    <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Your Request History
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {(studentRequests as AidRequest[]).map((request) => (
                    <div
                      key={request.id.toString()}
                      className={`rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.01] ${
                        request.isApproved
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : request.isProcessed
                          ? 'border-red-500/30 bg-red-500/5'
                          : 'border-amber-500/30 bg-amber-500/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-bold text-slate-100 mb-2">
                            ${formatUSDC(request.amount)} USDC
                          </p>
                          <p className="text-sm text-slate-300 mb-2 line-clamp-2">
                            {request.reason}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            {new Date(Number(request.timestamp) * 1000).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                            request.isApproved
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : request.isProcessed
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {request.isApproved
                            ? '✓ Approved'
                            : request.isProcessed
                            ? '✗ Rejected'
                            : '⏳ Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}