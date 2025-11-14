"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import useSWR from "swr";
import type { DexPair } from "@/types/pair";
import { fetchPairTimeseries } from "@/lib/api";
import { formatCurrency, formatDateTime, formatNumber, formatPercent } from "@/lib/format";

const metricClass = "rounded-2xl border border-white/5 bg-surface/80 p-4";

const tooltipFormatter = (value: number) => formatCurrency(value, { compact: false });

export type PairDetailProps = {
  pair: DexPair | null;
};

export function PairDetail({ pair }: PairDetailProps) {
  const { data: timeseries, isLoading } = useSWR(
    pair ? ["pair-timeseries", pair.chainId, pair.pairAddress] : null,
    ([, chainId, pairAddress]) => fetchPairTimeseries(pairAddress, chainId)
  );

  const latestPoint = timeseries?.[timeseries.length - 1];
  const latestVolume = useMemo(() => {
    if (!timeseries || timeseries.length === 0) return 0;
    return timeseries.slice(-8).reduce((total, point) => total + point.volumeUsd, 0);
  }, [timeseries]);

  if (!pair) {
    return (
      <aside className="flex h-full flex-col justify-center rounded-2xl border border-dashed border-white/10 bg-surface/40 p-6 text-center text-sm text-slate-500">
        Selecciona un par para visualizar detalles, gráficas y analítica avanzada.
      </aside>
    );
  }

  const price = pair.priceUsd ? Number(pair.priceUsd) : null;
  const change1h = pair.priceChange?.h1 ? Number(pair.priceChange.h1) : null;
  const change6h = pair.priceChange?.h6 ? Number(pair.priceChange.h6) : null;
  const change24h = pair.priceChange?.h24 ? Number(pair.priceChange.h24) : null;

  return (
    <aside className="flex h-full flex-col gap-6 rounded-2xl border border-white/5 bg-surface/70 p-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">{pair.dexId}</p>
            <h2 className="text-xl font-semibold text-white">
              {pair.baseToken?.symbol} / {pair.quoteToken?.symbol}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase text-slate-500">Último precio</p>
            <p className="text-2xl font-semibold text-white">
              {price ? `$${price.toLocaleString(undefined, { maximumFractionDigits: 6 })}` : "-"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-accent">
            {pair.chainId}
          </span>
          {pair.info?.websites?.[0] && (
            <a
              href={pair.info.websites[0].url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 px-3 py-1 text-slate-300 hover:border-accent hover:text-accent"
            >
              Sitio oficial
            </a>
          )}
          {pair.info?.socials?.slice(0, 2).map((social) => {
            let label = social.url;
            try {
              label = new URL(social.url).hostname.replace("www.", "");
            } catch (error) {
              label = social.url;
            }

            return (
              <a
                key={social.url}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/10 px-3 py-1 text-slate-300 hover:border-accent hover:text-accent"
              >
                {label}
              </a>
            );
          })}
        </div>
      </header>
      <section className="grid gap-4 sm:grid-cols-3">
        <div className={metricClass}>
          <p className="text-xs uppercase text-slate-500">Cambio 1h</p>
          <p className={`mt-2 text-lg font-semibold ${change1h && change1h > 0 ? "text-success" : change1h && change1h < 0 ? "text-danger" : "text-slate-200"}`}>
            {formatPercent(change1h)}
          </p>
        </div>
        <div className={metricClass}>
          <p className="text-xs uppercase text-slate-500">Cambio 6h</p>
          <p className={`mt-2 text-lg font-semibold ${change6h && change6h > 0 ? "text-success" : change6h && change6h < 0 ? "text-danger" : "text-slate-200"}`}>
            {formatPercent(change6h)}
          </p>
        </div>
        <div className={metricClass}>
          <p className="text-xs uppercase text-slate-500">Cambio 24h</p>
          <p className={`mt-2 text-lg font-semibold ${change24h && change24h > 0 ? "text-success" : change24h && change24h < 0 ? "text-danger" : "text-slate-200"}`}>
            {formatPercent(change24h)}
          </p>
        </div>
      </section>
      <section className="flex-1 rounded-2xl border border-white/5 bg-background/40 p-4">
        <p className="mb-3 text-xs uppercase tracking-wide text-slate-500">Precio (USD)</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeseries ?? []}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => formatDateTime(value).split(" ")[0]}
                stroke="rgba(255,255,255,0.2)"
                tick={{ fontSize: 10 }}
              />
              <YAxis
                orientation="right"
                stroke="rgba(255,255,255,0.2)"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => formatNumber(value as number, { compact: true })}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f1119",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.05)",
                  color: "#f8fafc"
                }}
                formatter={(value: number) => tooltipFormatter(value)}
                labelFormatter={(timestamp) => formatDateTime(Number(timestamp))}
              />
              <Area
                type="monotone"
                dataKey="priceUsd"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {isLoading && <p className="mt-2 text-xs text-slate-400">Cargando serie histórica…</p>}
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        <div className={metricClass}>
          <p className="text-xs uppercase text-slate-500">Liquidez total (USD)</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {formatCurrency(pair.liquidity?.usd ?? null, { compact: false })}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Base: {formatNumber(pair.liquidity?.base ?? null, { compact: true })} · Quote: {formatNumber(pair.liquidity?.quote ?? null, { compact: true })}
          </p>
        </div>
        <div className={metricClass}>
          <p className="text-xs uppercase text-slate-500">Volumen intradía</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {formatCurrency(latestVolume, { compact: true })}
          </p>
          <p className="mt-1 text-xs text-slate-400">Agregado últimas 4h</p>
        </div>
        <div className={metricClass}>
          <p className="text-xs uppercase text-slate-500">Transacciones</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {formatNumber(pair.txns?.h24 ?? null, { compact: true })}
          </p>
          <p className="mt-1 text-xs text-slate-400">24h • {formatNumber(pair.txns?.h1 ?? null, { compact: true })} últimas 1h</p>
        </div>
        <div className={metricClass}>
          <p className="text-xs uppercase text-slate-500">FDV estimado</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {formatCurrency(pair.fdv ?? null, { compact: false })}
          </p>
          <p className="mt-1 text-xs text-slate-400">Ref. DexScreener</p>
        </div>
      </section>
    </aside>
  );
}
