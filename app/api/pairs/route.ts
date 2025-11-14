import { NextRequest, NextResponse } from "next/server";
import type { DexPair } from "@/types/pair";

const STABLE_SYMBOLS = new Set([
  "USDC",
  "USDT",
  "DAI",
  "BUSD",
  "USDD",
  "TUSD",
  "FRAX",
  "LUSD",
  "USD+"
]);

const MEME_KEYWORDS = ["PEPE", "DOGE", "INU", "FLOKI", "SHIB", "WOJAK", "MEME"];

const classifyPairType = (baseSymbol: string, quoteSymbol: string) => {
  const upperBase = baseSymbol.toUpperCase();
  const upperQuote = quoteSymbol.toUpperCase();

  if (STABLE_SYMBOLS.has(upperBase) || STABLE_SYMBOLS.has(upperQuote)) {
    return "stable" as const;
  }

  if (MEME_KEYWORDS.some((word) => upperBase.includes(word) || upperQuote.includes(word))) {
    return "meme" as const;
  }

  return "volatile" as const;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("query")?.trim() || "top";
  const chainsParam = searchParams.get("chains")?.trim();
  const minLiquidity = Number(searchParams.get("minLiquidity") || "0");
  const minVolume = Number(searchParams.get("minVolume") || "0");
  const pairType = (searchParams.get("pairType") as "stable" | "volatile" | "meme" | "all") || "all";

  const chainFilters = chainsParam
    ? chainsParam
        .split(",")
        .map((id) => id.trim().toLowerCase())
        .filter(Boolean)
    : [];

  const apiUrl = `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`;

  const response = await fetch(apiUrl, {
    headers: {
      "User-Agent": "AgenticDeFiScreener/1.0"
    },
    next: { revalidate: 10 }
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Dexscreener API error" }, { status: response.status });
  }

  const data = await response.json();
  const pairs: DexPair[] = Array.isArray(data?.pairs) ? data.pairs : [];

  const filtered = pairs
    .filter((pair) => {
      if (!pair?.chainId) return false;
      const type = classifyPairType(pair.baseToken?.symbol ?? "", pair.quoteToken?.symbol ?? "");

      if (chainFilters.length > 0 && !chainFilters.includes(pair.chainId.toLowerCase())) {
        return false;
      }

      if (minLiquidity && (pair.liquidity?.usd ?? 0) < minLiquidity) {
        return false;
      }

      if (minVolume && (pair.volume?.h24 ?? 0) < minVolume) {
        return false;
      }

      if (pairType !== "all" && type !== pairType) {
        return false;
      }

      return true;
    })
    .slice(0, 60);

  return NextResponse.json({
    pairs: filtered,
    fetchedAt: new Date().toISOString()
  });
}
