import "./globals.css";
import type { Metadata } from "next";
import { WalletProvider } from "@/lib/wallet";
import { Navbar } from "@/components/navbar";
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: "CampusShield",
  description: "Onchain emergency fund for universities on Base",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersObj = await headers();
  const cookies = headersObj.get('cookie');

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <WalletProvider cookies={cookies}>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 px-4 py-6 sm:px-8 lg:px-16">
              {children}
            </main>
            <footer className="border-t border-slate-800 px-4 py-4 text-xs text-slate-400 sm:px-8 lg:px-16">
              CampusShield • Built on Base • Powered by USDC
            </footer>
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
