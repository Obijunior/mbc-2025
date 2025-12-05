// web/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { SidebarMenu } from "./SidebarMenu";
import { DashboardSwitcher } from "./DashboardSwitcher";

const links = [
  { href: "/", label: "Home" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="relative z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
      {/* Subtle gradient glow */}
      <div className="absolute inset-0 bg-sky-500/5 pointer-events-none" />

      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8 lg:px-12">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 border border-sky-500/30 transition-all duration-300 group-hover:scale-110 group-hover:border-sky-400/50 group-hover:shadow-lg group-hover:shadow-sky-500/30">
            <span className="text-base font-black text-sky-300 group-hover:text-sky-200 transition-colors">
              CS
            </span>
          </div>
          <span className="text-lg font-black tracking-tight text-white group-hover:text-sky-100 transition-colors">
            Campus Shield
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-2 sm:flex">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "group relative rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300",
                    isActive
                      ? "text-white"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  {/* Active indicator background */}
                  {isActive && (
                    <span className="absolute inset-0 rounded-xl bg-sky-500/20 border border-sky-500/30" />
                  )}

                  {/* Hover background */}
                  {!isActive && (
                    <span className="absolute inset-0 rounded-xl bg-slate-800/0 group-hover:bg-slate-800/50 border border-transparent group-hover:border-slate-700/50 transition-all duration-300" />
                  )}

                  {/* Text */}
                  <span className="relative">{link.label}</span>
                </Link>
              );
            })}

            {/* Dashboard Switcher */}
            <div className="ml-2 pl-2 border-l border-slate-800">
              <DashboardSwitcher />
            </div>
          </div>

          {/* Wallet Button */}
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-r from-sky-500/20 to-red-500/20 blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <appkit-button />
          </div>

          {/* Mobile Menu */}
          <SidebarMenu />
        </nav>
      </div>
    </header>
  );
}