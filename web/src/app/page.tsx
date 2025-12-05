'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGetStats, useGetUniversity } from '@/hooks/useContract';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Fetch real stats from contract
  const { data: stats } = useGetStats();
  const { data: universityData } = useGetUniversity(1n);

  // Use real data or fallback to demo values
  const fundAmount = stats ? Number(stats[2]) / 1e6 : 24300;
  const disbursed = stats ? Number(stats[3]) / 1e6 : 7620;
  const totalDonors = universityData ? Number(universityData[4]) : 118;
  const studentsHelped = stats ? Number(stats[1]) : 63;

  useEffect(() => {
    // Delay state updates to avoid synchronous render warnings and ensure smooth animation
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
        <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1400ms' }} />
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
                Live on Base • USDC-Powered Emergency Aid
              </span>
            </div>

            {/* Main Heading with better typography */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[1.1]">
              <span className="block text-white mb-2 drop-shadow-2xl">Emergency funds,</span>
              <span className="block bg-linear-to-r from-sky-600 via-sky-200 to-blue-400 bg-clip-text text-transparent animate-gradient drop-shadow-2xl">
                reimagined onchain
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
              CampusShield transforms university emergency aid into a transparent, instant, blockchain-powered safety net for students in crisis.
            </p>
          </div>
        </div>

        {/* Fund Display - Hero Stats Card */}
        <div className={`mt-20 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative max-w-5xl mx-auto group">
            {/* Animated glow effect */}
            <div className="absolute inset-0 bg-linear-to-r from-sky-500/20 via-purple-500/20 to-red-500/20 blur-3xl -z-10 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="rounded-3xl border border-slate-800/50 bg-slate-900/60 backdrop-blur-xl p-8 sm:p-12 shadow-2xl hover:border-slate-700/50 transition-all duration-500">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
                    University of Kansas Emergency Pool
                  </h2>
                  <p className="text-xs text-slate-500">Real-time blockchain data</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all duration-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-300">Live</span>
                </div>
              </div>

              {/* Main Stats */}
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                {/* Total Pool */}
                <div className="relative group/card">
                  <div className="absolute inset-0 bg-linear-to-br from-sky-500/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                  <div className="relative rounded-2xl border border-sky-500/20 bg-slate-950/80 p-6 hover:border-sky-500/50 hover:bg-slate-950/90 transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:shadow-2xl hover:shadow-sky-500/20">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-xs font-bold text-sky-400 uppercase tracking-[0.15em]">Total Pool</span>
                      <div className="p-2 rounded-xl bg-sky-500/10 group-hover/card:bg-sky-500/20 transition-all duration-300">
                        <svg className="w-6 h-6 text-sky-400 group-hover/card:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-5xl font-black text-white group-hover/card:text-sky-100 transition-colors duration-300">
                        ${fundAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-sky-300/80 font-medium">
                        {totalDonors} active donors
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disbursed */}
                <div className="relative group/card">
                  <div className="absolute inset-0 bg-linear-to-br from-red-500/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                  <div className="relative rounded-2xl border border-red-500/20 bg-slate-950/80 p-6 hover:border-red-500/50 hover:bg-slate-950/90 transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/20">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-xs font-bold text-red-400 uppercase tracking-[0.15em]">Disbursed</span>
                      <div className="p-2 rounded-xl bg-red-500/10 group-hover/card:bg-red-500/20 transition-all duration-300">
                        <svg className="w-6 h-6 text-red-400 group-hover/card:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-5xl font-black text-white group-hover/card:text-red-100 transition-colors duration-300">
                        ${disbursed.toLocaleString()}
                      </div>
                      <div className="text-sm text-red-300/80 font-medium">
                        {studentsHelped} students helped
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl border border-slate-800/50 bg-slate-950/60 hover:bg-slate-950/80 transition-all duration-300">
                <div className="text-center group/stat cursor-pointer">
                  <div className="text-3xl font-black text-white mb-1 group-hover/stat:text-sky-300 transition-colors duration-300">$120</div>
                  <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Avg. grant</div>
                </div>
                <div className="text-center border-x border-slate-800/50 group/stat cursor-pointer">
                  <div className="text-3xl font-black text-white mb-1 group-hover/stat:text-purple-300 transition-colors duration-300">6min</div>
                  <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">To receive</div>
                </div>
                <div className="text-center group/stat cursor-pointer">
                  <div className="text-3xl font-black text-white mb-1 group-hover/stat:text-red-300 transition-colors duration-300">$250</div>
                  <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Max / student</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column: Donors & Students */}
        <div className={`mt-24 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* For Donors */}
            <div className="group/section relative">
              <div className="absolute inset-0 bg-linear-to-br from-sky-500/10 to-transparent rounded-3xl blur-2xl opacity-0 group-hover/section:opacity-100 transition-all duration-700" />
              <div className="relative h-full rounded-3xl border border-slate-800/50 bg-slate-900/60 backdrop-blur-sm p-8 hover:border-sky-500/40 hover:bg-slate-900/80 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-sky-500/20 flex flex-col">
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 group-hover/section:bg-sky-500/20 group-hover/section:border-sky-500/40 transition-all duration-300 group-hover/section:scale-110">
                      <svg className="w-7 h-7 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-sky-400 uppercase tracking-[0.2em]">For Donors</span>
                    </div>
                  </div>

                  <h3 className="text-3xl font-black text-white group-hover/section:text-sky-50 transition-colors duration-300">
                    Support students when it matters most
                  </h3>
                  <br></br>
                  <div className="flex-1" />

                  <p className="text-slate-300 leading-relaxed text-base font-light">
                    Fund transparent emergency pools with USDC on Base. Every donation is tracked onchain, every disbursement is visible, and every dollar goes directly to students in crisis.
                  </p>
                </div>

                <div className="mt-auto pt-8">
                  <ul className="space-y-3 mb-8">
                    {['100% transparent onchain tracking', 'Direct wallet-to-wallet transfers', 'See real impact metrics'].map((item, idx) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-slate-300 group-hover/section:text-slate-200 transition-all duration-300" style={{ transitionDelay: `${idx * 50}ms` }}>
                        <div className="p-1 rounded-lg bg-sky-500/10 group-hover/section:bg-sky-500/20 transition-all duration-300">
                          <svg className="w-4 h-4 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/donor"
                    className="group/btn inline-flex items-center justify-center w-full gap-2 rounded-xl bg-linear-to-r from-sky-500 to-sky-600 px-6 py-4 font-bold text-white shadow-lg shadow-sky-900/50 hover:shadow-sky-900/80 hover:scale-[1.05] transition-all duration-300 hover:from-sky-400 hover:to-sky-500"
                  >
                    Start Donating
                    <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* For Students */}
            <div className="group/section relative">
              <div className="absolute inset-0 bg-linear-to-br from-red-500/10 to-transparent rounded-3xl blur-2xl opacity-0 group-hover/section:opacity-100 transition-all duration-700" />
              <div className="relative h-full rounded-3xl border border-slate-800/50 bg-slate-900/60 backdrop-blur-sm p-8 hover:border-red-500/40 hover:bg-slate-900/80 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/20 flex flex-col">
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 group-hover/section:bg-red-500/20 group-hover/section:border-red-500/40 transition-all duration-300 group-hover/section:scale-110">
                      <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-red-400 uppercase tracking-[0.2em]">For Students</span>
                    </div>
                  </div>

                  <h3 className="text-3xl font-black text-white group-hover/section:text-red-50 transition-colors duration-300">
                    Get help in hours, not weeks
                  </h3>

                  <div className="flex-1" />

                  <p className="text-slate-300 leading-relaxed text-base font-light">
                    Verified students can request emergency funds directly to their wallet. No paperwork, no waiting rooms—just fast, transparent relief when life throws a curveball.
                  </p>
                </div>

                <div className="mt-auto pt-8">
                  <ul className="space-y-3 mb-8">
                    {['Instant payout to your wallet', 'Up to $250 in emergency aid', 'Simple verification process'].map((item, idx) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-slate-300 group-hover/section:text-slate-200 transition-all duration-300" style={{ transitionDelay: `${idx * 50}ms` }}>
                        <div className="p-1 rounded-lg bg-red-500/10 group-hover/section:bg-red-500/20 transition-all duration-300">
                          <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/student"
                    className="group/btn inline-flex items-center justify-center w-full gap-2 rounded-xl bg-linear-to-r from-red-500 to-red-600 px-6 py-4 font-bold text-white shadow-lg shadow-red-900/50 hover:shadow-red-900/80 hover:scale-[1.05] transition-all duration-300 hover:from-red-400 hover:to-red-500"
                  >
                    Request Aid
                    <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className={`mt-24 text-center transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-3 text-sm text-slate-400 hover:text-slate-300 transition-colors duration-300">
            <span className="flex h-2 w-2 rounded-full bg-slate-600" />
            <span className="font-medium">Secured by Base L2</span>
            <span className="text-slate-700">•</span>
            <span className="font-medium">Powered by USDC</span>
            <span className="text-slate-700">•</span>
            <span className="font-medium">Built for universities</span>
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