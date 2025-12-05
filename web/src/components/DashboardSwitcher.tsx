"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutDashboard, Heart, GraduationCap, Shield } from "lucide-react";
import clsx from "clsx";

const dashboards = [
    { href: "/donor", label: "Donor Dashboard", icon: Heart, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
    { href: "/student", label: "Student Dashboard", icon: GraduationCap, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    { href: "/admin", label: "Admin Dashboard", icon: Shield, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
];

export function DashboardSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Find active dashboard
    const activeDashboard = dashboards.find(d => pathname.startsWith(d.href));

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300",
                    activeDashboard
                        ? `${activeDashboard.bg} ${activeDashboard.border} ${activeDashboard.color}`
                        : "bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
            >
                {activeDashboard ? (
                    <>
                        <activeDashboard.icon className="w-4 h-4" />
                        <span className="text-sm font-semibold">{activeDashboard.label}</span>
                    </>
                ) : (
                    <>
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="text-sm font-semibold">Dashboards</span>
                    </>
                )}
                <ChevronDown className={clsx("w-4 h-4 transition-transform duration-300", isOpen && "rotate-180")} />
            </button>

            {/* Dropdown */}
            <div
                className={clsx(
                    "absolute top-full right-0 mt-2 w-64 p-2 rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/50 transition-all duration-200 z-[100]",
                    isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"
                )}
            >
                <div className="space-y-1">
                    {dashboards.map((dashboard) => {
                        const Icon = dashboard.icon;
                        const isActive = pathname.startsWith(dashboard.href);

                        return (
                            <Link
                                key={dashboard.href}
                                href={dashboard.href}
                                onClick={() => setIsOpen(false)}
                                className={clsx(
                                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
                                    isActive
                                        ? "bg-slate-800 text-white"
                                        : "hover:bg-slate-900 text-slate-400 hover:text-white"
                                )}
                            >
                                <div className={clsx(
                                    "p-2 rounded-lg transition-colors",
                                    isActive ? dashboard.bg : "bg-slate-800 group-hover:bg-slate-700"
                                )}>
                                    <Icon className={clsx("w-4 h-4", isActive ? dashboard.color : "text-slate-400 group-hover:text-white")} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">{dashboard.label}</span>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                                        {dashboard.href === '/donor' ? 'For Supporters' :
                                            dashboard.href === '/student' ? 'For Students' : 'For Staff'}
                                    </span>
                                </div>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
