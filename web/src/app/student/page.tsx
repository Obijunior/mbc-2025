// web/app/student/page.tsx
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
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Student Emergency Support
        </h1>
        <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
          Request emergency funds directly to your wallet. Funds are distributed
          in USDC on Base for instant, transparent relief.
        </p>
      </header>

      {/* Connection Status */}
      {!isConnected ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-sm text-amber-200">
            Please connect your wallet to request emergency aid.
          </p>
        </div>
      ) : universityError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm font-medium text-red-200">
            ⚠️ No universities registered yet
          </p>
          <p className="text-xs text-red-300 mt-1">
            A university administrator needs to register their institution first before students can request aid.
          </p>
        </div>
      ) : (
        <>
          {/* Student Stats */}
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-xs font-medium text-slate-400">USDC Balance</p>
              <p className="text-xl font-bold text-white">
                ${usdcBalance !== undefined ? formatUSDC(usdcBalance) : '0.00'}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="text-xs font-medium text-emerald-400">Total Received</p>
              <p className="text-xl font-bold text-emerald-300">
                ${formatUSDC(totalReceived)}
              </p>
            </div>
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 col-span-2 sm:col-span-1">
              <p className="text-xs font-medium text-sky-400">Pending Requests</p>
              <p className="text-xl font-bold text-sky-300">
                {pendingRequests.length}
              </p>
            </div>
          </section>

          {/* Request Form */}
          <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-sm font-semibold text-slate-100">
              Request Emergency Aid
            </h2>

            {txStatus === 'success' ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-sm text-emerald-200 font-medium">
                    ✅ Request submitted successfully!
                  </p>
                  <p className="text-xs text-emerald-300 mt-1">
                    Your request is now pending review by the university admin.
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  className="w-full rounded-xl bg-slate-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-600"
                >
                  Submit Another Request
                </button>
              </div>
            ) : txStatus === 'error' ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                  <p className="text-sm text-red-200 font-medium">
                    Transaction failed
                  </p>
                  <p className="text-xs text-red-300 mt-1">
                    {error?.message || 'Unknown error'}
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  className="w-full rounded-xl bg-slate-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-600"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {/* University Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">
                    University
                  </label>
                  <select
                    value={selectedUniversity.toString()}
                    onChange={(e) => setSelectedUniversity(BigInt(e.target.value))}
                    disabled={isPending}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
                  >
                    {UNIVERSITIES.map((uni) => (
                      <option key={uni.id.toString()} value={uni.id.toString()}>
                        {uni.name}
                      </option>
                    ))}
                  </select>
                  {universityData && (
                    <p className="text-xs text-slate-500">
                      Fund balance: ${formatUSDC(universityBalance)} USDC
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">
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
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/40 focus:border-sky-500 focus:ring-2 disabled:opacity-60"
                  />
                  <p className="text-xs text-slate-500">Maximum: $250 USDC per request</p>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">
                    Reason for Request
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Briefly describe your emergency situation..."
                    disabled={isPending}
                    rows={3}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/40 focus:border-sky-500 focus:ring-2 disabled:opacity-60 resize-none"
                  />
                </div>

                {/* Transaction Status */}
                {txStatus === 'pending' && (
                  <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
                      <p className="text-sm text-sky-200">
                        {isPending ? 'Submitting request...' : isConfirming ? 'Confirming transaction...' : 'Processing...'}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleRequestAid}
                  disabled={!amount || !reason || isPending || isConfirming}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? 'Submitting...' : isConfirming ? 'Confirming...' : 'Submit Request'}
                </button>
              </>
            )}
          </section>

          {/* Request History */}
          {studentRequests && (studentRequests as AidRequest[]).length > 0 && (
            <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <h2 className="text-sm font-semibold text-slate-100">
                Your Request History
              </h2>
              <div className="space-y-3">
                {(studentRequests as AidRequest[]).map((request) => (
                  <div
                    key={request.id.toString()}
                    className={`rounded-xl border p-3 ${
                      request.isApproved
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : request.isProcessed
                        ? 'border-red-500/30 bg-red-500/5'
                        : 'border-amber-500/30 bg-amber-500/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-100">
                          ${formatUSDC(request.amount)} USDC
                        </p>
                        <p className="text-xs text-slate-400 mt-1 truncate">
                          {request.reason}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(Number(request.timestamp) * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
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
  );
}
