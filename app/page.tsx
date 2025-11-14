"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Header } from "@/components/header";
import { SearchFilters } from "@/components/search-filters";
import { PairTable } from "@/components/pair-table";
import { PairDetail } from "@/components/pair-detail";
import { fetchPairs } from "@/lib/api";
import type { DexPair } from "@/types/pair";
import { formatCurrency, formatNumber } from "@/lib/format";

const defaultChains = ["ethereum", "bsc", "solana", "base"];

export default function Page() {
  const [queryInput, setQueryInput] = useState("ETH");
  const [searchTerm, setSearchTerm] = useState("ETH");
  const [selectedChains, setSelectedChains] = useState<string[]>(defaultChains);
  const [minLiquidity, setMinLiquidity] = useState(100000);
  const [minVolume, setMinVolume] = useState(0);
  const [pairType, setPairType] = useState("all");
  const [selectedPair, setSelectedPair] = useState<DexPair | null>(null);

  const swrKey = useMemo(
    () => [
      "pairs",
      searchTerm,
      selectedChains.slice().sort().join(","),
      minLiquidity,
      minVolume,
      pairType
    ],
    [searchTerm, selectedChains, minLiquidity, minVolume, pairType]
  );

  const { data, isLoading } = useSWR(swrKey, () =>
    fetchPairs({
      query: searchTerm,
      chainIds: selectedChains,
      minLiquidity,
      minVolume24h: minVolume,
      pairType: pairType as any
    })
  );

  const pairs = useMemo(() => data?.pairs ?? [], [data?.pairs]);

  useEffect(() => {
    if (!selectedPair && pairs.length > 0) {
      setSelectedPair(pairs[0]);
      return;
    }

    if (selectedPair) {
      const exists = pairs.find((pair) => pair.pairAddress === selectedPair.pairAddress);
      if (!exists && pairs.length > 0) {
        setSelectedPair(pairs[0]);
      }
    }
  }, [pairs, selectedPair]);

  const toggleChain = useCallback((chainId: string) => {
    setSelectedChains((prev) => {
      if (prev.includes(chainId)) {
        const next = prev.filter((item) => item !== chainId);
        return next.length > 0 ? next : prev;
      }
      return [...prev, chainId];
    });
  }, []);

  const handleSearch = useCallback(() => {
    setSearchTerm(queryInput.trim() || "top");
  }, [queryInput]);

  const headlineMetrics = useMemo(() => {
    if (pairs.length === 0) {
      return {
        totalLiquidity: 0,
        totalVolume: 0,
        avgTxns: 0,
        uniqueDexes: 0
      };
    }

    const totalLiquidity = pairs.reduce((total, pair) => total + (pair.liquidity?.usd ?? 0), 0);
    const totalVolume = pairs.reduce((total, pair) => total + (pair.volume?.h24 ?? 0), 0);
    const avgTxns =
      pairs.reduce((total, pair) => total + (pair.txns?.h24 ?? 0), 0) / Math.max(pairs.length, 1);
    const uniqueDexes = new Set(pairs.map((pair) => pair.dexId)).size;

    return { totalLiquidity, totalVolume, avgTxns, uniqueDexes };
  }, [pairs]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/5 bg-surface/70 p-4">
            <p className="text-xs uppercase text-slate-400">Liquidez agregada</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatCurrency(headlineMetrics.totalLiquidity, { compact: true })}
            </p>
            <p className="mt-1 text-xs text-slate-500">Redes seleccionadas</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-surface/70 p-4">
            <p className="text-xs uppercase text-slate-400">Volumen 24h</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatCurrency(headlineMetrics.totalVolume, { compact: true })}
            </p>
            <p className="mt-1 text-xs text-slate-500">{pairs.length} pares</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-surface/70 p-4">
            <p className="text-xs uppercase text-slate-400">Txns promedio</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatNumber(headlineMetrics.avgTxns, { compact: true })}
            </p>
            <p className="mt-1 text-xs text-slate-500">24h / par</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-surface/70 p-4">
            <p className="text-xs uppercase text-slate-400">DEXs únicos</p>
            <p className="mt-2 text-2xl font-semibold text-white">{headlineMetrics.uniqueDexes}</p>
            <p className="mt-1 text-xs text-slate-500">Origen de la liquidez</p>
          </div>
        </section>
        <SearchFilters
          query={queryInput}
          onQueryChange={setQueryInput}
          onSubmit={handleSearch}
          selectedChains={selectedChains}
          onToggleChain={toggleChain}
          minLiquidity={minLiquidity}
          onMinLiquidityChange={setMinLiquidity}
          minVolume={minVolume}
          onMinVolumeChange={setMinVolume}
          pairType={pairType}
          onPairTypeChange={setPairType}
        />
        <section className="grid gap-6 lg:grid-cols-[1.5fr_minmax(0,1fr)]">
          <PairTable
            pairs={pairs}
            loading={isLoading}
            onSelect={setSelectedPair}
            selectedPairAddress={selectedPair?.pairAddress}
          />
          <PairDetail pair={selectedPair} />
        </section>
      </main>
    </div>
  );
}
