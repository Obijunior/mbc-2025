// web/app/admin/page.tsx
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
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Admin Dashboard
        </h1>
        <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
          Manage your university emergency fund. Approve or reject aid requests.
        </p>
      </header>

      {!isConnected ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-sm text-amber-200">
            Please connect your wallet to access the admin dashboard.
          </p>
        </div>
      ) : (
        <>
          {/* University Selection */}
          <div className="flex items-center gap-4">
            <label className="text-sm text-slate-400">University ID:</label>
            <input
              type="number"
              min="1"
              value={selectedUniversityId.toString()}
              onChange={(e) => setSelectedUniversityId(BigInt(e.target.value || "1"))}
              className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-white"
            />
            {universityCount && (
              <span className="text-xs text-slate-500">
                (Total universities: {universityCount.toString()})
              </span>
            )}
          </div>

          {/* University Stats */}
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-xs font-medium text-slate-400">University</p>
              <p className="text-lg font-bold text-white truncate">{universityName}</p>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="text-xs font-medium text-emerald-400">Fund Balance</p>
              <p className="text-lg font-bold text-emerald-300">
                ${formatUSDC(universityBalance)}
              </p>
            </div>
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4">
              <p className="text-xs font-medium text-sky-400">Donors</p>
              <p className="text-lg font-bold text-sky-300">{donorCount.toString()}</p>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="text-xs font-medium text-amber-400">Pending</p>
              <p className="text-lg font-bold text-amber-300">{pendingCount}</p>
            </div>
          </section>

          {/* Admin Status */}
          {universityData && (
            <div className={`rounded-xl border p-3 ${
              isAdmin 
                ? 'border-emerald-500/30 bg-emerald-500/10' 
                : 'border-red-500/30 bg-red-500/10'
            }`}>
              <p className={`text-sm ${isAdmin ? 'text-emerald-200' : 'text-red-200'}`}>
                {isAdmin 
                  ? '✓ You are the admin of this university' 
                  : `✗ You are not the admin. Admin: ${universityData[1]}`}
              </p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'pending'
                  ? 'border-b-2 border-sky-500 text-sky-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending Requests ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'all'
                  ? 'border-b-2 border-sky-500 text-sky-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Requests
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'register'
                  ? 'border-b-2 border-sky-500 text-sky-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register New
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'pending' && (
            <section className="space-y-4">
              {pendingCount === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center">
                  <p className="text-slate-400">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(pendingRequests as AidRequest[])?.map((request) => (
                    <div
                      key={request.id.toString()}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                              Request #{request.id.toString()}
                            </span>
                            <span className="text-lg font-bold text-white">
                              ${formatUSDC(request.amount)} USDC
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 mb-2">{request.reason}</p>
                          <p className="text-xs text-slate-500">
                            From: {request.student.slice(0, 6)}...{request.student.slice(-4)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(Number(request.timestamp) * 1000).toLocaleString()}
                          </p>
                        </div>
                        
                        {isAdmin && (
                          <div className="flex gap-2 sm:flex-col">
                            <button
                              onClick={() => handleApprove(request.id)}
                              disabled={isApproving || isRejecting || processingId === request.id}
                              className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-400 disabled:opacity-50"
                            >
                              {processingId === request.id && isApproving ? 'Approving...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              disabled={isApproving || isRejecting || processingId === request.id}
                              className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400 disabled:opacity-50"
                            >
                              {processingId === request.id && isRejecting ? 'Rejecting...' : 'Reject'}
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
            <section className="space-y-4">
              {!allRequests || (allRequests as AidRequest[]).length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center">
                  <p className="text-slate-400">No requests yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(allRequests as AidRequest[]).map((request) => (
                    <div
                      key={request.id.toString()}
                      className={`rounded-xl border p-4 ${
                        request.isApproved
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : request.isProcessed
                          ? 'border-red-500/30 bg-red-500/5'
                          : 'border-amber-500/30 bg-amber-500/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-slate-100">
                              #{request.id.toString()} - ${formatUSDC(request.amount)} USDC
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{request.reason}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {request.student.slice(0, 6)}...{request.student.slice(-4)} • {new Date(Number(request.timestamp) * 1000).toLocaleDateString()}
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
                          {request.isApproved ? 'Approved' : request.isProcessed ? 'Rejected' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'register' && (
            <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <h2 className="text-sm font-semibold text-slate-100">
                Register New University
              </h2>
              <p className="text-xs text-slate-400">
                Register a new university emergency fund. You will become the admin.
              </p>

              {registerSuccess ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-sm text-emerald-200 font-medium">
                    ✓ University registered successfully!
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">
                      University Name
                    </label>
                    <input
                      type="text"
                      value={newUniversityName}
                      onChange={(e) => setNewUniversityName(e.target.value)}
                      placeholder="e.g., University of Kansas"
                      disabled={isRegistering}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/40 focus:border-sky-500 focus:ring-2 disabled:opacity-60"
                    />
                  </div>

                  {registerError && (
                    <p className="text-xs text-red-400">{registerError.message}</p>
                  )}

                  <button
                    onClick={handleRegister}
                    disabled={!newUniversityName.trim() || isRegistering}
                    className="w-full rounded-xl bg-sky-500 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isRegistering ? 'Registering...' : 'Register University'}
                  </button>
                </>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
