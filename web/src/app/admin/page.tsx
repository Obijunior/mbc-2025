"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  useGetPendingRequests,
  useGetUniversityRequests,
  useGetUniversity,
  useApproveAid,
  useRejectAid,
  useRegisterUniversity,
  useUniversityCount,
} from "@/hooks/useContract";
import { formatUSDC, type AidRequest } from "@/lib/contracts";

// Demo - in production, admin would select their university
const ADMIN_UNIVERSITY_ID = 1n;

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [selectedUniversityId, setSelectedUniversityId] = useState(ADMIN_UNIVERSITY_ID);
  const [newUniversityName, setNewUniversityName] = useState("");
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'register'>('pending');
  const [processingId, setProcessingId] = useState<bigint | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Contract hooks
  const { data: universityData, refetch: refetchUniversity } = useGetUniversity(selectedUniversityId);
  const { data: pendingRequests, refetch: refetchPending } = useGetPendingRequests(selectedUniversityId);
  const { data: allRequests, refetch: refetchAll } = useGetUniversityRequests(selectedUniversityId);
  const { data: universityCount } = useUniversityCount();

  const {
    approveAid,
    isPending: isApproving,
    isSuccess: approveSuccess,
  } = useApproveAid();

  const {
    rejectAid,
    isPending: isRejecting,
    isSuccess: rejectSuccess,
  } = useRejectAid();

  const {
    register,
    isPending: isRegistering,
    isSuccess: registerSuccess,
    error: registerError,
  } = useRegisterUniversity();

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle approve/reject success
  useEffect(() => {
    if (approveSuccess || rejectSuccess) {
      setProcessingId(null);
      refetchPending();
      refetchAll();
      refetchUniversity();
    }
  }, [approveSuccess, rejectSuccess, refetchPending, refetchAll, refetchUniversity]);

  // Handle register success
  useEffect(() => {
    if (registerSuccess) {
      setNewUniversityName("");
    }
  }, [registerSuccess]);

  const handleApprove = (requestId: bigint) => {
    setProcessingId(requestId);
    approveAid(requestId);
  };

  const handleReject = (requestId: bigint) => {
    setProcessingId(requestId);
    rejectAid(requestId);
  };

  const handleRegister = () => {
    if (!newUniversityName.trim()) return;
    register(newUniversityName);
  };

  // Check if connected address is the admin
  const isAdmin = universityData && address === universityData[1];

  // University stats
  const universityName = universityData ? universityData[0] : "Loading...";
  const universityBalance = universityData ? universityData[2] : 0n;
  const donorCount = universityData ? universityData[4] : 0n;

  const pendingCount = (pendingRequests as AidRequest[] | undefined)?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.5) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-16 sm:px-8">
        {/* Header */}
        <header className={`space-y-4 mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-4 py-2 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="text-xs font-semibold text-purple-300 tracking-[0.2em] uppercase">
              Admin Dashboard
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            Fund Management
          </h1>
          
          <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
            Manage your university emergency fund. Approve or reject aid requests and monitor fund activity.
          </p>
        </header>

        {!isConnected ? (
          <div className={`rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm p-6 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 flex-shrink-0">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-amber-200">
                Please connect your wallet to access the admin dashboard.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* University Selection */}
            <div className={`rounded-2xl border border-slate-800/50 bg-slate-900/60 backdrop-blur-sm p-6 mb-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  University ID:
                </label>
                <input
                  type="number"
                  min="1"
                  value={selectedUniversityId.toString()}
                  onChange={(e) => setSelectedUniversityId(BigInt(e.target.value || "1"))}
                  className="w-32 rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2 text-base font-semibold text-white outline-none ring-purple-500/40 focus:border-purple-500 focus:ring-2 transition-all duration-300"
                />
                {universityCount && (
                  <span className="text-sm text-slate-400 font-medium">
                    Total universities: {universityCount.toString()}
                  </span>
                )}
              </div>
            </div>

            {/* University Stats */}
            <section className={`grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="group relative rounded-2xl border border-slate-800/50 bg-slate-900/60 backdrop-blur-sm p-6 hover:border-slate-700 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">University</p>
                  <p className="text-xl font-black text-white truncate">{universityName}</p>
                </div>
              </div>
              
              <div className="group relative rounded-2xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm p-6 hover:border-emerald-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Fund Balance</p>
                  <p className="text-xl font-black text-emerald-300">
                    ${formatUSDC(universityBalance)}
                  </p>
                </div>
              </div>
              
              <div className="group relative rounded-2xl border border-sky-500/30 bg-sky-500/10 backdrop-blur-sm p-6 hover:border-sky-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <p className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">Donors</p>
                  <p className="text-xl font-black text-sky-300">{donorCount.toString()}</p>
                </div>
              </div>
              
              <div className="group relative rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm p-6 hover:border-amber-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Pending</p>
                  <p className="text-xl font-black text-amber-300">{pendingCount}</p>
                </div>
              </div>
            </section>

            {/* Admin Status */}
            {universityData && (
              <div className={`rounded-2xl border p-6 mb-8 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${
                isAdmin 
                  ? 'border-emerald-500/30 bg-emerald-500/10' 
                  : 'border-red-500/30 bg-red-500/10'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl flex-shrink-0 ${
                    isAdmin ? 'bg-emerald-500/20' : 'bg-red-500/20'
                  }`}>
                    <svg className={`w-6 h-6 ${isAdmin ? 'text-emerald-400' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {isAdmin ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      )}
                    </svg>
                  </div>
                  <div>
                    <p className={`text-base font-bold ${isAdmin ? 'text-emerald-200' : 'text-red-200'}`}>
                      {isAdmin 
                        ? 'You are the admin of this university' 
                        : 'You are not the admin'}
                    </p>
                    {!isAdmin && (
                      <p className="text-sm text-red-300/80 mt-1">
                        Admin: {universityData[1].slice(0, 6)}...{universityData[1].slice(-4)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className={`flex gap-2 border-b border-slate-800 mb-8 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                  activeTab === 'pending'
                    ? 'border-b-2 border-purple-500 text-purple-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                  activeTab === 'all'
                    ? 'border-b-2 border-purple-500 text-purple-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Requests
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                  activeTab === 'register'
                    ? 'border-b-2 border-purple-500 text-purple-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register New
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'pending' && (
              <section className={`space-y-4 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {pendingCount === 0 ? (
                  <div className="rounded-2xl border border-slate-800/50 bg-slate-900/60 backdrop-blur-sm p-12 text-center">
                    <div className="inline-flex p-4 rounded-2xl bg-slate-800/50 mb-4">
                      <svg className="w-12 h-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-bold text-slate-400">No pending requests</p>
                    <p className="text-sm text-slate-500 mt-2">All requests have been processed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(pendingRequests as AidRequest[])?.map((request) => (
                      <div
                        key={request.id.toString()}
                        className="group rounded-2xl border border-slate-800/50 bg-slate-900/60 backdrop-blur-sm p-6 hover:border-amber-500/40 transition-all duration-300"
                      >
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 uppercase tracking-wider">
                                Request #{request.id.toString()}
                              </span>
                              <span className="text-2xl font-black text-white">
                                ${formatUSDC(request.amount)} USDC
                              </span>
                            </div>
                            <p className="text-base text-slate-200 leading-relaxed">{request.reason}</p>
                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-slate-400 font-medium">
                                From: <code className="text-slate-300 font-mono">{request.student.slice(0, 6)}...{request.student.slice(-4)}</code>
                              </p>
                              <p className="text-sm text-slate-500 font-medium">
                                {new Date(Number(request.timestamp) * 1000).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          
                          {isAdmin && (
                            <div className="flex gap-3 lg:flex-col min-w-[140px]">
                              <button
                                onClick={() => handleApprove(request.id)}
                                disabled={isApproving || isRejecting || processingId === request.id}
                                className="group/btn flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 font-bold text-white shadow-lg shadow-emerald-900/50 hover:shadow-emerald-900/80 hover:scale-[1.02] transition-all duration-300 hover:from-emerald-400 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                              >
                                {processingId === request.id && isApproving ? 'Approving...' : 'Approve'}
                                <svg className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleReject(request.id)}
                                disabled={isApproving || isRejecting || processingId === request.id}
                                className="group/btn flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-5 py-3 font-bold text-white shadow-lg shadow-red-900/50 hover:shadow-red-900/80 hover:scale-[1.02] transition-all duration-300 hover:from-red-400 hover:to-red-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                              >
                                {processingId === request.id && isRejecting ? 'Rejecting...' : 'Reject'}
                                <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === 'all' && (
              <section className={`space-y-4 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {!allRequests || (allRequests as AidRequest[]).length === 0 ? (
                  <div className="rounded-2xl border border-slate-800/50 bg-slate-900/60 backdrop-blur-sm p-12 text-center">
                    <div className="inline-flex p-4 rounded-2xl bg-slate-800/50 mb-4">
                      <svg className="w-12 h-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-bold text-slate-400">No requests yet</p>
                    <p className="text-sm text-slate-500 mt-2">Request history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(allRequests as AidRequest[]).map((request) => (
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
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-lg font-black text-slate-100">
                                #{request.id.toString()}
                              </span>
                              <span className="text-lg font-black text-white">
                                ${formatUSDC(request.amount)} USDC
                              </span>
                            </div>
                            <p className="text-sm text-slate-300 line-clamp-2">{request.reason}</p>
                            <p className="text-xs text-slate-500 font-medium">
                              <code className="text-slate-400">{request.student.slice(0, 6)}...{request.student.slice(-4)}</code> • {new Date(Number(request.timestamp) * 1000).toLocaleDateString('en-US', {
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
                            {request.isApproved ? '✓ Approved' : request.isProcessed ? '✗ Rejected' : '⏳ Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === 'register' && (
              <section className={`rounded-3xl border border-slate-800/50 bg-slate-900/60 backdrop-blur-sm p-8 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20">
                    <svg className="w-7 h-7 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Register New University
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Register a new university emergency fund. You will become the admin.
                    </p>
                  </div>
                </div>

                {registerSuccess ? (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-emerald-500/20 flex-shrink-0">
                        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-emerald-200">University registered successfully!</p>
                        <p className="text-sm text-emerald-300/80 mt-1">You are now the administrator of this fund.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-300 uppercase tracking-wider block">
                        University Name
                      </label>
                      <input
                        type="text"
                        value={newUniversityName}
                        onChange={(e) => setNewUniversityName(e.target.value)}
                        placeholder="e.g., University of Kansas"
                        disabled={isRegistering}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-5 py-4 text-lg font-semibold text-white outline-none ring-sky-500/40 focus:border-sky-500 focus:ring-2 disabled:opacity-60 transition-all duration-300 placeholder:text-slate-600"
                      />
                    </div>

                    {registerError && (
                      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                        <p className="text-sm text-red-300 font-medium">{registerError.message}</p>
                      </div>
                    )}

                    <button
                      onClick={handleRegister}
                      disabled={!newUniversityName.trim() || isRegistering}
                      className="group/btn w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 px-6 py-4 font-bold text-white shadow-lg shadow-sky-900/50 hover:shadow-sky-900/80 hover:scale-[1.02] transition-all duration-300 hover:from-sky-400 hover:to-sky-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                    >
                      {isRegistering ? 'Registering...' : 'Register University'}
                      <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}