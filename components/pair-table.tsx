"use client";

import { ArrowTopRightOnSquareIcon, BoltIcon, FireIcon } from "@heroicons/react/24/outline";
import clsx from "classnames";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/es";
import type { DexPair } from "@/types/pair";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.locale("es");

export type PairTableProps = {
  pairs: DexPair[];
  loading: boolean;
  onSelect: (pair: DexPair) => void;
  selectedPairAddress?: string;
};

const getActivityChip = (pair: DexPair) => {
  const volume = pair.volume?.h24 ?? 0;
  const txns = pair.txns?.h24 ?? 0;

  if (volume > 5_000_000) {
    return { label: "Institucional", icon: BoltIcon, tone: "bg-accent/10 text-accent" };
  }

  if (txns > 1500) {
    return { label: "Caliente", icon: FireIcon, tone: "bg-orange-500/10 text-orange-300" };
  }

  return null;
};

export function PairTable({ pairs, loading, onSelect, selectedPairAddress }: PairTableProps) {
  return (
    <div id="markets" className="rounded-2xl border border-white/5 bg-surface/70">
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-white">Mercados detectados</p>
          <p className="text-xs text-slate-400">Actualizado en tiempo real desde DexScreener</p>
        </div>
        {loading && <span className="text-xs text-accent">Actualizando…</span>}
      </div>
      <div className="scrollbar-thin max-h-[32rem] overflow-y-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-surface">
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3">Par</th>
              <th className="px-6 py-3">Red</th>
              <th className="px-6 py-3 text-right">Precio</th>
              <th className="px-6 py-3 text-right">Cambio 24h</th>
              <th className="px-6 py-3 text-right">Volumen 24h</th>
              <th className="px-6 py-3 text-right">Liquidez</th>
              <th className="px-6 py-3 text-right">FDV</th>
              <th className="px-6 py-3 text-right">Txns 24h</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-200">
            {pairs.map((pair) => {
              const price = pair.priceUsd ? Number(pair.priceUsd) : null;
              const change = pair.priceChange?.h24 ? Number(pair.priceChange.h24) : null;
              const activity = getActivityChip(pair);
              const isSelected = selectedPairAddress === pair.pairAddress;

              return (
                <tr
                  key={`${pair.chainId}-${pair.pairAddress}`}
                  className={clsx(
                    "cursor-pointer bg-transparent transition hover:bg-white/[0.03]",
                    isSelected && "bg-accent/10"
                  )}
                  onClick={() => onSelect(pair)}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {pair.baseToken?.symbol ?? "?"}
                        </span>
                        <span className="text-xs text-slate-500">/</span>
                        <span className="text-xs text-slate-300">{pair.quoteToken?.symbol ?? "?"}</span>
                        {activity && (
                          <span
                            className={clsx(
                              "flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold",
                              activity.tone
                            )}
                          >
                            <activity.icon className="h-3 w-3" />
                            {activity.label}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span>{pair.dexId}</span>
                        <span>•</span>
                        <span>{dayjs(pair.pairCreatedAt ?? Date.now()).fromNow(true)} en mercado</span>
                        <a
                          href={pair.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-accent"
                          onClick={(event) => event.stopPropagation()}
                        >
                          Ver <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs uppercase text-slate-400">{pair.chainId}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-white">
                    {price ? `$${price.toLocaleString(undefined, { maximumFractionDigits: 6 })}` : "-"}
                  </td>
                  <td
                    className={clsx(
                      "px-6 py-4 text-right text-sm font-semibold",
                      change && change > 0 ? "text-success" : change && change < 0 ? "text-danger" : "text-slate-300"
                    )}
                  >
                    {formatPercent(change)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">{formatCurrency(pair.volume?.h24 ?? null, { compact: true })}</td>
                  <td className="px-6 py-4 text-right text-sm">{formatCurrency(pair.liquidity?.usd ?? null, { compact: true })}</td>
                  <td className="px-6 py-4 text-right text-sm">{formatCurrency(pair.fdv ?? null, { compact: true })}</td>
                  <td className="px-6 py-4 text-right text-sm">{formatNumber(pair.txns?.h24 ?? null, { compact: true })}</td>
                </tr>
              );
            })}

            {pairs.length === 0 && !loading && (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-500">
                  No se encontraron pares para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
