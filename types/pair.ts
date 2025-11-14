export type DexPair = {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    symbol: string;
    name: string;
  };
  quoteToken: {
    address: string;
    symbol: string;
    name: string;
  };
  priceUsd: number | null;
  priceNative: number | null;
  priceChange?: {
    m5?: number | null;
    h1?: number | null;
    h6?: number | null;
    h24?: number | null;
  };
  txns: {
    h24: number;
    h6: number;
    h1: number;
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
  };
  liquidity: {
    usd: number | null;
    base: number | null;
    quote: number | null;
  };
  fdv: number | null;
  pairCreatedAt: number | null;
  info?: {
    imageUrl?: string;
    websites?: { url: string }[];
    socials?: { url: string }[];
  };
};

export type PairTimeSeriesPoint = {
  timestamp: number;
  priceUsd: number;
  volumeUsd: number;
};

export type NetworkOption = {
  id: string;
  label: string;
  type: "evm" | "non-evm";
};
