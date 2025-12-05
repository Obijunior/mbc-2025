"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Heart, GraduationCap, Shield } from "lucide-react";
import clsx from "clsx";

const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/donor", label: "Donor Dashboard", icon: Heart },
    { href: "/student", label: "Student Dashboard", icon: GraduationCap },
    { href: "/admin", label: "Admin Dashboard", icon: Shield },
];

export function SidebarMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <div className="md:hidden">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                aria-label="Open menu"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Overlay */}
            <div
                className={clsx(
                    "fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <div
                className={clsx(
                    "fixed inset-y-0 right-0 z-50 w-64 bg-slate-900 border-l border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out transform",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-800">
                        <span className="font-bold text-white">Menu</span>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                            aria-label="Close menu"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Links */}
                    <nav className="flex-1 overflow-y-auto py-4">
                        <ul className="space-y-1 px-2">
                            {links.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href;
                                return (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className={clsx(
                                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                                isActive
                                                    ? "bg-sky-500/10 text-sky-400"
                                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span className="font-medium">{link.label}</span>
                                            {isActive && (
                                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-800">
                        <div className="text-xs text-slate-500 text-center">
                            Campus Shield © 2025
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
