"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Mercados", href: "#markets" },
  { label: "Alertas", href: "#alerts" },
  { label: "Análisis", href: "#analytics" }
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-2xl font-bold text-accent">
            Δ
          </div>
          <div>
            <p className="text-lg font-semibold">Agentic Screener</p>
            <p className="text-xs text-slate-400">Monitoreo multicadena en tiempo real</p>
          </div>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => setOpen((value) => !value)}
          className="rounded-md p-2 text-slate-300 hover:bg-white/5 md:hidden"
          aria-label="Abrir navegación"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>
      {open && (
        <nav className="border-t border-white/10 bg-surface px-4 py-3 text-sm text-slate-300 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-white"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
