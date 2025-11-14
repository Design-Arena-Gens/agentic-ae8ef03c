"use client";

import { AdjustmentsHorizontalIcon, FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import clsx from "classnames";
import { NETWORKS, NETWORK_GROUPS } from "@/lib/networks";

const PAIR_TYPES = [
  { id: "all", label: "Todos" },
  { id: "stable", label: "Stables" },
  { id: "volatile", label: "Volátiles" },
  { id: "meme", label: "Memecoins" }
];

export type SearchFiltersProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  selectedChains: string[];
  onToggleChain: (chainId: string) => void;
  minLiquidity: number;
  onMinLiquidityChange: (value: number) => void;
  minVolume: number;
  onMinVolumeChange: (value: number) => void;
  pairType: string;
  onPairTypeChange: (value: string) => void;
};

export function SearchFilters(props: SearchFiltersProps) {
  return (
    <section className="rounded-2xl border border-white/5 bg-surface/80 p-4 shadow-lg sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <MagnifyingGlassIcon className="hidden h-5 w-5 text-slate-400 sm:block" />
          <input
            value={props.query}
            onChange={(event) => props.onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                props.onSubmit();
              }
            }}
            placeholder="Buscar token, par o dirección"
            className="w-full rounded-xl border border-white/5 bg-background/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-accent focus:outline-none"
          />
          <button
            onClick={props.onSubmit}
            className="hidden rounded-xl bg-accent/80 px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent md:block"
          >
            Analizar
          </button>
        </div>
        <button
          onClick={props.onSubmit}
          className="flex items-center justify-center gap-2 rounded-xl bg-accent/80 px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent md:hidden"
        >
          <FunnelIcon className="h-5 w-5" />
          Buscar
        </button>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
            <AdjustmentsHorizontalIcon className="h-4 w-4" /> Redes
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {NETWORK_GROUPS.map((group) => (
              <div key={group.type} className="rounded-xl border border-white/5 bg-background/50 p-3">
                <p className="mb-2 text-xs font-semibold text-slate-400">{group.label}</p>
                <div className="flex flex-wrap gap-2">
                  {NETWORKS.filter((network) => network.type === group.type).map((network) => {
                    const selected = props.selectedChains.includes(network.id);
                    return (
                      <button
                        key={network.id}
                        onClick={() => props.onToggleChain(network.id)}
                        className={clsx(
                          "rounded-full border px-3 py-1 text-xs font-medium transition",
                          selected
                            ? "border-accent/70 bg-accent/10 text-accent"
                            : "border-white/5 bg-white/[0.02] text-slate-300 hover:border-white/20"
                        )}
                      >
                        {network.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Liquidez mínima (USD)</p>
          <div className="grid grid-cols-2 gap-3">
            {[0, 25000, 100000, 500000].map((value) => (
              <button
                key={value}
                onClick={() => props.onMinLiquidityChange(value)}
                className={clsx(
                  "rounded-xl border px-4 py-3 text-sm transition",
                  props.minLiquidity === value
                    ? "border-accent/80 bg-accent/15 text-accent"
                    : "border-white/5 bg-background/40 text-slate-300 hover:border-white/20"
                )}
              >
                {value === 0 ? "Cualquiera" : `≥ $${value.toLocaleString()}`}
              </button>
            ))}
          </div>
          <input
            type="number"
            min={0}
            step={1000}
            value={props.minLiquidity}
            onChange={(event) => props.onMinLiquidityChange(Number(event.target.value) || 0)}
            className="mt-3 w-full rounded-xl border border-white/5 bg-background/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-accent focus:outline-none"
            placeholder="Otra cantidad"
          />
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Volumen 24h mínimo (USD)</p>
          <div className="grid grid-cols-2 gap-3">
            {[0, 10000, 100000, 1000000].map((value) => (
              <button
                key={value}
                onClick={() => props.onMinVolumeChange(value)}
                className={clsx(
                  "rounded-xl border px-4 py-3 text-sm transition",
                  props.minVolume === value
                    ? "border-accent/80 bg-accent/15 text-accent"
                    : "border-white/5 bg-background/40 text-slate-300 hover:border-white/20"
                )}
              >
                {value === 0 ? "Cualquiera" : `≥ $${value.toLocaleString()}`}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Tipo de par</p>
            <div className="flex flex-wrap gap-2">
              {PAIR_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => props.onPairTypeChange(type.id)}
                  className={clsx(
                    "rounded-full border px-4 py-2 text-xs font-semibold transition",
                    props.pairType === type.id
                      ? "border-accent/80 bg-accent/15 text-accent"
                      : "border-white/5 bg-background/40 text-slate-300 hover:border-white/20"
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
