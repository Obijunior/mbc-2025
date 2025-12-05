import "./globals.css";
import type { Metadata } from "next";
import { WalletProvider } from "@/lib/wallet";
import { Navbar } from "@/components/Navbar";
import { headers } from 'next/headers';
import MiniAppInit from "@/components/MiniAppInit";

export const metadata: Metadata = {
  title: "CampusShield",
  description: "Onchain emergency fund for universities on Base",
  appleWebApp: {
    title: "CampusShield",
    statusBarStyle: "black-translucent",
    startupImage: [
      "/apple-icon.png",
    ],
  },
  other: {
    "fc:miniapp": JSON.stringify({
      version: "next",
      imageUrl: "https://mbc-2025.vercel.app/og.png",
      button: {
        title: "Open App",
        action: {
          type: "launch_miniapp",
          name: "CampusShield",
          url: "https://mbc-2025.vercel.app",
        },
      },
    }),
  },
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
        <MiniAppInit />
        <WalletProvider cookies={cookies}>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
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