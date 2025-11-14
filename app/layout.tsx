import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agentic DeFi Screener",
  description:
    "Monitor multi-chain DeFi liquidity pools and token pairs with real-time updates, analytics, and alerts.",
  themeColor: "#05060a"
};

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
