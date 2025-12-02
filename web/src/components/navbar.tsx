// web/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/", label: "Home" },
  { href: "/donor", label: "Donor" },
  { href: "/student", label: "Student" },
  { href: "/admin", label: "Admin" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-8 lg:px-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
            CS
          </div>
          <span className="text-sm font-semibold tracking-tight sm:text-base">
            CampusShield
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <div className="hidden items-center gap-3 text-xs sm:flex sm:text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "rounded-full px-3 py-1 transition-colors",
                  pathname === link.href
                    ? "bg-sky-500/10 text-sky-300"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <appkit-button />
        </nav>
      </div>
    </header>
  );
}
