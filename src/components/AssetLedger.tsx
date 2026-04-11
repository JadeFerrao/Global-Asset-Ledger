"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import styled, { keyframes } from "styled-components";
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  Globe,
  ChevronRight,
  Menu,
  X,
  RefreshCw
} from "lucide-react";
import AssetAgent from "./AssetAgent";

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { opacity: 0.4; }
  50% { opacity: 0.7; }
  100% { opacity: 0.4; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const skeletonPulse = keyframes`
  0% { opacity: 0.7; }
  50% { opacity: 0.3; }
  100% { opacity: 0.7; }
`;

// --- Styled Components ---
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--background);
  color: var(--foreground);
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  flex-wrap: wrap; 
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: var(--card-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--card-border);

  @media (min-width: 768px) {
    padding: 1rem 1.5rem;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  order: 1;
`;

const LogoIcon = styled.div`
  background: var(--primary);
  padding: 0.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 0 20px var(--primary-glow);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  
  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  flex: 1;
  min-width: 100%;
  order: 3;
  margin-top: 0.75rem;
  position: relative;

  @media (min-width: 768px) {
    min-width: 0; // prevent overflow
    max-width: 30rem;
    order: 2;
    margin: 0 1rem;
    margin-top: 0;
  }
  
  @media (min-width: 1024px) {
    max-width: 36rem;
    margin: 0 2rem;
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  background: var(--glass);
  border: 1px solid var(--card-border);
  color: var(--foreground);
  outline: none;

  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-glow);
  }
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 0.875rem 1.25rem;
  border-radius: 0.75rem;
  background: var(--glass);
  border: 1px solid var(--card-border);
  color: var(--foreground);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(99, 102, 241, 0.05);
    border-color: rgba(99, 102, 241, 0.4);
  }

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-glow);
  }

  option {
    background: var(--background);
    color: var(--foreground);
    padding: 1rem;
  }
`;

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem;
  gap: 1rem;
  max-width: 80rem;
  margin: 0 auto;
  width: 100%;

  @media (min-width: 768px) {
    padding: 1.5rem;
    gap: 1.5rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
  animation: ${fadeIn} 0.6s ease forwards;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const GlassCard = styled.div<{ $delay?: string }>`
  background: var(--card-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--card-border);
  border-radius: 1rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.6s ease forwards;
  ${props => props.$delay && `animation-delay: ${props.$delay};`}
  
  &:hover {
    border-color: rgba(99, 102, 241, 0.5);
  }
`;

const StatIconBox = styled.div`
  background: var(--glass);
  border: 1px solid var(--card-border);
  padding: 0.625rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  ${GlassCard}:hover & {
    background: var(--primary-glow);
    border-color: rgba(99, 102, 241, 0.2);
  }
`;

const LedgerSection = styled(GlassCard)`
  flex: 1;
  padding: 0;
  overflow: hidden;
`;

const TableContainer = styled.div`
  overflow: auto;
  background: transparent;
  flex: 1;
`;

const StyledTable = styled.table`
  width: 100%;
  text-align: left;
  border-collapse: collapse;
  min-width: 700px;
`;

const TableHead = styled.thead`
  position: sticky;
  top: 0;
  z-index: 10;
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--card-bg);
  backdrop-filter: blur(12px);
`;

const Th = styled.th`
  padding: 1rem 1.5rem;
  font-weight: 500;
  border-bottom: 1px solid var(--card-border);
`;

const Tr = styled.tr`
  transition: background-color 0.2s ease;
  border-bottom: 1px solid var(--card-border);
  &:hover {
    background-color: var(--glass);
  }
`;

const Td = styled.td`
  padding: 1rem 1.5rem;
`;

const ChangeBadge = styled.span<{ $negative?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  background: ${props => props.$negative ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)'};
  color: ${props => props.$negative ? 'rgb(251, 113, 133)' : 'rgb(52, 211, 153)'};
`;

const SidebarOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(6, 7, 10, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-end;
  padding: 1rem;

  @media (min-width: 640px) {
    align-items: center;
    justify-content: center;
  }
`;

const SidebarCard = styled(GlassCard)`
  width: 100%;
  max-width: 28rem;
  padding: 1.5rem;
`;



const PulseDot = styled.span`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: #10b981;
  animation: ${pulse} 2s infinite;
`;

const LiveFeedInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  order: 2;

  @media (min-width: 768px) {
    order: 3;
  }
`;

const SpinnerWrapper = styled.div`
  display: inline-flex;
  animation: ${spin} 1s linear infinite;
`;

const SkeletonBox = styled.div<{ $width?: string, $height?: string, $rounded?: string }>`
  width: ${props => props.$width || '100%'};
  height: ${props => props.$height || '1rem'};
  border-radius: ${props => props.$rounded || '0.5rem'};
  background: var(--card-border);
  animation: ${skeletonPulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;

interface AssetData {
  id: string;
  name: string;
  symbol: string;
  value: string;
  change: string;
  volume: string;
  region: string;
  iconUrl?: string;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
}

function StatCard({ icon, label, value, change }: StatCardProps) {
  const isPositive = change.startsWith('+');
  return (
    <GlassCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <StatIconBox>
          {icon}
        </StatIconBox>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isPositive ? 'var(--emerald-400, #34d399)' : 'var(--primary)' }}>
          {change}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</span>
        <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{value}</span>
      </div>
    </GlassCard>
  );
}

// Helper: format raw CoinGecko item into AssetData
function formatAsset(item: any): AssetData {
  return {
    id: item.id,
    name: item.name,
    symbol: item.symbol.toUpperCase(),
    value: Number(item.current_price ?? 0).toFixed(2),
    change: Number(item.price_change_percentage_24h ?? 0).toFixed(2),
    volume: Number(item.total_volume ?? 0).toFixed(0),
    region: ["Global", "APAC", "EMEA", "AMER"][Math.floor(Math.random() * 4)],
    iconUrl: item.image,
  };
}

function computeStats(data: AssetData[], latencyMs: number) {
  let totalVolume = 0;
  for (const item of data) {
    totalVolume += Number(item.volume || 0);
  }
  const volumeStr = totalVolume > 1e9
    ? `$${(totalVolume / 1e9).toFixed(2)}B`
    : `$${(totalVolume / 1e6).toFixed(2)}M`;
  return { volume: volumeStr, latency: `${latencyMs}ms` };
}

export default function AssetLedger() {
  const [isMounted, setIsMounted] = useState(false);
  const [rawData, setRawData] = useState<AssetData[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState("");

  // Debounce the search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(inputValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [inputValue]);

  const [regionFilter, setRegionFilter] = useState("All");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);

  const [isOnline, setIsOnline] = useState(true);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [livePrices, setLivePrices] = useState<Record<string, string>>({});
  const [stats, setStats] = useState({ volume: "$0", latency: "0ms" });

  // Refs for WebSocket to avoid stale closures
  const wsRef = useRef<WebSocket | null>(null);
  const wsConnectedRef = useRef(false);

  // --- Mount + online/offline tracking ---
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // --- Progressive Data Fetching ---
  // Step 1: Fetch first 50 assets immediately via server-side proxy
  // Step 2: Then fetch remaining 950 assets in background
  useEffect(() => {
    if (!isMounted) return;

    let cancelled = false;
    const startTime = performance.now();

    const fetchInitialBatch = async () => {
      try {
        // Fetch first page of 50 via our server-side proxy
        const res = await fetch('/api/assets?page=1&per_page=50');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (cancelled) return;

        const formatted = (json.data || []).map(formatAsset);
        const latency = Math.round(performance.now() - startTime);

        setRawData(formatted);
        setStats(computeStats(formatted, latency));
        setIsFetching(false); // Show UI immediately with first 50
        setFetchError(null);

        // Now fetch remaining pages in background
        fetchRemainingBatches(formatted, startTime);
      } catch (err: any) {
        console.error("Failed to fetch initial assets", err);
        if (!cancelled) {
          setFetchError(err.message || "Failed to fetch assets");
          setIsFetching(false);
        }
      }
    };

    const fetchRemainingBatches = async (initialData: AssetData[], startMs: number) => {
      try {
        // Fetch all 1000 assets from server-side proxy (uses caching + retry)
        const res = await fetch('/api/assets?page=0');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (cancelled) return;

        const allFormatted = (json.data || []).map(formatAsset);
        const latency = Math.round(performance.now() - startMs);

        setRawData(allFormatted);
        setStats(computeStats(allFormatted, latency));
      } catch (err) {
        console.error("Failed to fetch remaining assets (using initial batch)", err);
        // Keep the initial data – the user can already see 50 assets
      }
    };

    fetchInitialBatch();

    return () => { cancelled = true; };
  }, [isMounted]);

  // --- WebSocket Live Feed ---
  useEffect(() => {
    if (!isMounted) return;

    let reconnectTimer: NodeJS.Timeout | null = null;

    const connectWs = () => {
      // Clean up previous
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.onmessage = null;
        try { wsRef.current.close(); } catch (_) {}
      }

      const ws = new WebSocket('wss://ws.coincap.io/prices?assets=ALL');
      wsRef.current = ws;

      ws.onopen = () => {
        wsConnectedRef.current = true;
        setIsWsConnected(true);
      };

      ws.onclose = () => {
        wsConnectedRef.current = false;
        setIsWsConnected(false);
        // Auto-reconnect after 5 seconds
        reconnectTimer = setTimeout(connectWs, 5000);
      };

      ws.onerror = () => {
        wsConnectedRef.current = false;
        setIsWsConnected(false);
      };

      ws.onmessage = (msg) => {
        try {
          const liveData = JSON.parse(msg.data);
          setLivePrices(prev => ({ ...prev, ...liveData }));
        } catch (_) {
          // Safe fail
        }
      };
    };

    connectWs();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.onmessage = null;
        try { wsRef.current.close(); } catch (_) {}
        wsRef.current = null;
      }
      wsConnectedRef.current = false;
      setIsWsConnected(false);
    };
  }, [isMounted]);

  // --- High-Performance Filtering ---
  const filteredData = useMemo(() => {
    let result = rawData;

    if (regionFilter !== "All") {
      result = result.filter(item => item.region === regionFilter);
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        item =>
          item.name.toLowerCase().includes(lowerSearch) ||
          item.id.toLowerCase().includes(lowerSearch) ||
          item.symbol.toLowerCase().includes(lowerSearch)
      );
    }

    return result;
  }, [search, regionFilter, rawData]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(50);
  }, [search, regionFilter]);

  const displayedData = useMemo(() => {
    return filteredData.slice(0, visibleCount);
  }, [filteredData, visibleCount]);

  // --- Infinite Scroll via IntersectionObserver ---
  // Data is already in memory, so loading more is just an array slice — no delay needed.
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + 50, filteredData.length));
  }, [filteredData.length]);

  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredData.length) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '400px' }
    );

    observer.observe(currentTarget);

    return () => observer.disconnect();
  }, [visibleCount, filteredData.length, loadMore]);

  if (!isMounted || isFetching) {
    return (
      <Container>
        <Header>
          <LogoContainer>
            <LogoIcon>
              <Globe className="w-6 h-6 text-white" size={24} color="white" />
            </LogoIcon>
            <Title>
              Asset<span style={{ color: 'var(--primary)' }}>Ledger</span>
            </Title>
          </LogoContainer>
          <LiveFeedInfo>
            <SkeletonBox $width="8rem" $height="1rem" $rounded="0.25rem" />
          </LiveFeedInfo>
        </Header>
        <MainContent>
          <StatsGrid>
            <GlassCard style={{ height: '7rem', justifyContent: 'space-between' }}>
              <SkeletonBox $width="2rem" $height="2rem" $rounded="0.5rem" />
              <SkeletonBox $width="60%" $height="1.5rem" />
            </GlassCard>
            <GlassCard style={{ height: '7rem', justifyContent: 'space-between' }}>
              <SkeletonBox $width="2rem" $height="2rem" $rounded="0.5rem" />
              <SkeletonBox $width="60%" $height="1.5rem" />
            </GlassCard>
            <GlassCard style={{ height: '7rem', justifyContent: 'space-between' }}>
              <SkeletonBox $width="2rem" $height="2rem" $rounded="0.5rem" />
              <SkeletonBox $width="60%" $height="1.5rem" />
            </GlassCard>
            <GlassCard style={{ height: '7rem', justifyContent: 'space-between' }}>
              <SkeletonBox $width="2rem" $height="2rem" $rounded="0.5rem" />
              <SkeletonBox $width="60%" $height="1.5rem" />
            </GlassCard>
          </StatsGrid>
          <LedgerSection style={{ minHeight: '30rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <SkeletonBox $width="12rem" $height="2rem" />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <SkeletonBox $width="2.5rem" $height="2.5rem" />
                <SkeletonBox $width="2.5rem" $height="2.5rem" />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonBox key={i} $width="100%" $height="3.5rem" $rounded="0.5rem" />
              ))}
            </div>
          </LedgerSection>
        </MainContent>
      </Container>
    );
  }

  if (fetchError && rawData.length === 0) {
    return (
      <Container>
        <Header>
          <LogoContainer>
            <LogoIcon>
              <Globe className="w-6 h-6 text-white" size={24} color="white" />
            </LogoIcon>
            <Title>
              Asset<span style={{ color: 'var(--primary)' }}>Ledger</span>
            </Title>
          </LogoContainer>
        </Header>
        <MainContent>
          <GlassCard style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Failed to Load Assets
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              {fetchError}
            </p>
            <button
              onClick={() => {
                setFetchError(null);
                setIsFetching(true);
                // Re-trigger mount effect
                setIsMounted(false);
                setTimeout(() => setIsMounted(true), 50);
              }}
              style={{
                padding: '0.75rem 2rem',
                background: 'var(--primary)',
                color: 'white',
                borderRadius: '0.75rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Retry
            </button>
          </GlassCard>
        </MainContent>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <LogoContainer>
          <LogoIcon>
            <Globe className="w-6 h-6 text-white" size={24} color="white" />
          </LogoIcon>
          <Title>
            Asset<span style={{ color: 'var(--primary)' }}>Ledger</span>
          </Title>
        </LogoContainer>

        <SearchContainer>
          <SearchIconWrapper>
            <Search size={16} />
          </SearchIconWrapper>
          <SearchInput
            type="text"
            placeholder="Search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </SearchContainer>

        <LiveFeedInfo>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live Feed</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {isOnline && isWsConnected ? (
              <>
                <PulseDot />
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>CONNECTED</span>
              </>
            ) : (
              <>
                <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#ef4444' }}>{isOnline ? 'CONNECTING...' : 'OFFLINE'}</span>
              </>
            )}
          </div>
        </LiveFeedInfo>
      </Header>

      <MainContent>
        {isSidebarOpen && (
          <SidebarOverlay onClick={() => setIsSidebarOpen(false)}>
            <SidebarCard onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Advanced Filters</h2>
                <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', color: 'inherit', border: 'none', cursor: 'pointer' }}><X /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase' }}>Region</label>
                  <StyledSelect
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                  >
                    <option value="All">All Regions</option>
                    <option value="Global">Global</option>
                    <option value="APAC">APAC</option>
                    <option value="EMEA">EMEA</option>
                    <option value="AMER">AMER</option>
                  </StyledSelect>
                </div>
                <button
                  style={{ width: '100%', padding: '1rem', background: 'var(--primary)', color: 'white', borderRadius: '0.75rem', marginTop: '1.5rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Apply Filters
                </button>
              </div>
            </SidebarCard>
          </SidebarOverlay>
        )}

        <StatsGrid>
          <StatCard icon={<Activity size={20} color="#34d399" />} label="Total Volume" value={stats.volume} change="+12.4%" />
          <StatCard icon={<Layers size={20} color="#60a5fa" />} label="Assets Linked" value={rawData.length.toLocaleString()} change="+201" />
          <StatCard icon={<ArrowUpRight size={20} color="#6366f1" />} label="Avg. Latency" value={stats.latency} change="-2ms" />
          <StatCard icon={<RefreshCw size={20} color={isOnline ? "#fb7185" : "#64748b"} />} label="Nodes Sync" value={isOnline ? "99.99%" : "0.00%"} change={isOnline ? "Live" : "Halted"} />
        </StatsGrid>

        <LedgerSection $delay="0.2s">
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Live Asset Log
                <span style={{ fontSize: '0.75rem', fontWeight: 400, background: 'var(--glass)', padding: '0.25rem 0.5rem', borderRadius: '9999px', color: 'var(--text-muted)' }}>
                  {filteredData.length.toLocaleString()} records
                </span>
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Global ledger sync at {new Date().toLocaleTimeString()}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setIsSidebarOpen(true)}
                style={{ padding: '0.625rem', cursor: 'pointer', borderRadius: '0.5rem', background: 'var(--glass)', border: '1px solid var(--card-border)', color: 'inherit' }}
              >
                <Filter size={16} />
              </button>
            </div>
          </div>

          <TableContainer>
            <StyledTable>
              <TableHead>
                <tr>
                  <Th>Asset ID</Th>
                  <Th>Asset Name</Th>
                  <Th>Market Value</Th>
                  <Th style={{ textAlign: 'center' }}>24h Change</Th>
                  <Th>Region</Th>
                </tr>
              </TableHead>
              <tbody>
                {displayedData.map((item, idx) => (
                  <Tr key={item.id + idx}>
                    <Td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'rgba(99, 102, 241, 0.8)' }}>{item.id}</Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.65rem', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}>
                          {item.iconUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.iconUrl} alt={item.symbol} style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%' }} />
                          ) : (
                            item.symbol
                          )}
                        </div>
                        <span style={{ fontWeight: 500 }}>{item.name}</span>
                      </div>
                    </Td>
                    <Td style={{ fontWeight: 500 }}>
                      ${livePrices[item.id]
                        ? Number(livePrices[item.id]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })
                        : Number(item.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })
                      }
                    </Td>
                    <Td style={{ textAlign: 'center' }}>
                      <ChangeBadge $negative={item.change.startsWith('-')}>
                        {item.change.startsWith('-') ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                        {Math.abs(Number(item.change))}%
                      </ChangeBadge>
                    </Td>
                    <Td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.region}</Td>
                  </Tr>
                ))}
              </tbody>
            </StyledTable>
            <div ref={observerTarget} style={{ height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {visibleCount < filteredData.length ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <SpinnerWrapper>
                    <RefreshCw size={12} />
                  </SpinnerWrapper>
                  Syncing more records... ({displayedData.length} of {filteredData.length.toLocaleString()})
                </div>
              ) : filteredData.length > 0 ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  All {filteredData.length.toLocaleString()} records loaded
                </div>
              ) : null}
            </div>
          </TableContainer>
        </LedgerSection>
      </MainContent>
      <AssetAgent ledgerData={rawData} />
    </Container>
  );
}
