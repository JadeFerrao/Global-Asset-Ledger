import { NextRequest, NextResponse } from "next/server";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3/coins/markets";

// Simple in-memory cache
let cache: { data: any[]; timestamp: number } | null = null;
const CACHE_DURATION = 60_000; // 1 minute cache

async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 },
      });
      if (res.ok) return res;
      // CoinGecko rate limit: 429
      if (res.status === 429 && i < retries - 1) {
        await new Promise((r) => setTimeout(r, delay * (i + 1)));
        continue;
      }
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, delay * (i + 1)));
    }
  }
  throw new Error("All retries failed");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = parseInt(searchParams.get("per_page") || "50", 10);

  // If requesting all data and cache is fresh, return cached
  if (page === 0 && cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return NextResponse.json({ data: cache.data, cached: true });
  }

  try {
    if (page === 0) {
      // Fetch all pages (1000 assets = 4 pages of 250)
      const pages = [1, 2, 3, 4];
      const results = await Promise.allSettled(
        pages.map((p) =>
          fetchWithRetry(
            `${COINGECKO_BASE}?vs_currency=usd&order=market_cap_desc&per_page=250&page=${p}&sparkline=false`
          ).then((res) => res.json())
        )
      );

      const allData: any[] = [];
      for (const result of results) {
        if (result.status === "fulfilled") {
          allData.push(...result.value);
        }
      }

      // Update cache
      cache = { data: allData, timestamp: Date.now() };

      return NextResponse.json({ data: allData, cached: false });
    } else {
      // Fetch a single page
      const res = await fetchWithRetry(
        `${COINGECKO_BASE}?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false`
      );
      const data = await res.json();
      return NextResponse.json({ data, cached: false });
    }
  } catch (err: any) {
    console.error("CoinGecko API proxy error:", err.message);
    // Return cached data if available, even if stale
    if (cache) {
      return NextResponse.json({
        data: cache.data,
        cached: true,
        stale: true,
      });
    }
    return NextResponse.json(
      { error: "Failed to fetch asset data", message: err.message },
      { status: 502 }
    );
  }
}
