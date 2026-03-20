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
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--card-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--card-border);
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
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
  display: none;
  flex: 1;
  max-width: 36rem;
  margin: 0 2rem;
  position: relative;

  @media (min-width: 768px) {
    display: block;
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

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1.5rem;
  max-width: 80rem;
  margin: 0 auto;
  width: 100%;

  @media (min-width: 768px) {
    padding: 1.5rem;
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

const MobileMenuButton = styled.button`
  padding: 0.5rem;
  color: var(--text-muted);
  background: transparent;
  display: block;

  @media (min-width: 768px) {
    display: none;
  }
`;

const PulseDot = styled.span`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: #10b981;
  animation: ${pulse} 2s infinite;
`;

const LiveFeedInfo = styled.div`
  display: none;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 0.5rem;

  @media (min-width: 640px) {
    display: flex;
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

// --- Mock Data Generator ---
// We simulate a massive dataset of 100,000 records
const GENERATED_RECORDS = 100000;
const rawData = Array.from({ length: GENERATED_RECORDS }).map((_, i) => ({
  id: `ASSET-${i + 1000}`,
  name: ["Bitcoin", "Ethereum", "Solana", "Polkadot", "Avalanche", "Chainlink"][i % 6] + ` v${i % 10}`,
  symbol: ["BTC", "ETH", "SOL", "DOT", "AVAX", "LINK"][i % 6],
  value: (Math.random() * 50000 + 1000).toFixed(2),
  change: (Math.random() * 10 - 5).toFixed(2),
  volume: (Math.random() * 1000000000).toFixed(0),
  timestamp: new Date().toLocaleTimeString(),
  region: ["Global", "APAC", "EMEA", "AMER"][i % 4],
}));

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

export default function AssetLedger() {
  const [isMounted, setIsMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // High-Performance Filtering Strategy:
  // We use useMemo to avoid re-calculating the filter on every re-render.
  // For even larger datasets, we would move this to a Web Worker or handle it on the Server.
  const filteredData = useMemo(() => {
    if (!search) return rawData;
    const lowerSearch = search.toLowerCase();
    return rawData.filter(
      item => 
        item.name.toLowerCase().includes(lowerSearch) || 
        item.id.toLowerCase().includes(lowerSearch) ||
        item.symbol.toLowerCase().includes(lowerSearch)
    );
  }, [search]);

  const displayedData = useMemo(() => {
    return filteredData.slice(0, visibleCount);
  }, [filteredData, visibleCount]);

  // Performance Strategy: Infinite Scroll / Virtualization
  // We render a slice of the data and use IntersectionObserver to load more.
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && visibleCount < filteredData.length) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, filteredData.length, isLoading]);

  const loadMore = useCallback(() => {
    setIsLoading(true);
    // Simulate network delay for "massive API" feel
    setTimeout(() => {
      setVisibleCount(prev => prev + 50);
      setIsLoading(false);
    }, 400);
  }, []);

  if (!isMounted) {
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <SkeletonBox $width="8rem" $height="1rem" $rounded="0.25rem" className="hidden sm:block" />
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'var(--card-border)' }}></div>
          </div>
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
                 {Array.from({length: 6}).map((_, i) => (
                    <SkeletonBox key={i} $width="100%" $height="3.5rem" $rounded="0.5rem" />
                 ))}
              </div>
           </LedgerSection>
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
            placeholder="Search 1,000,000+ records..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchContainer>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MobileMenuButton onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </MobileMenuButton>
          <LiveFeedInfo>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live Feed</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <PulseDot />
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>CONNECTED</span>
            </div>
          </LiveFeedInfo>
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: '1px solid var(--card-border)' }}></div>
        </div>
      </Header>

      <MainContent>
        {isSidebarOpen && (
          <SidebarOverlay onClick={() => setIsSidebarOpen(false)}>
            <SidebarCard onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Advanced Filters</h2>
                <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', color: 'inherit' }}><X /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase' }}>Universal Search</label>
                  <SearchInput style={{ paddingLeft: '1rem' }} value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase' }}>Region</label>
                  <select style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--glass)', border: '1px solid var(--card-border)', color: 'inherit' }}>
                    <option>Global</option>
                    <option>APAC</option>
                    <option>EMEA</option>
                  </select>
                </div>
                <button 
                  style={{ width: '100%', padding: '1rem', background: 'var(--primary)', color: 'white', borderRadius: '0.75rem', marginTop: '1.5rem', fontWeight: 700 }}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Apply Filters
                </button>
              </div>
            </SidebarCard>
          </SidebarOverlay>
        )}

        <StatsGrid>
          <StatCard icon={<Activity size={20} color="#34d399" />} label="Total Volume" value="$4.2T" change="+12.4%" />
          <StatCard icon={<Layers size={20} color="#60a5fa" />} label="Assets Linked" value="1,042,391" change="+201" />
          <StatCard icon={<ArrowUpRight size={20} color="#6366f1" />} label="Avg. Latency" value="14ms" change="-2ms" />
          <StatCard icon={<RefreshCw size={20} color="#fb7185" />} label="Nodes Sync" value="99.99%" change="Live" />
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
              <button style={{ padding: '0.625rem', borderRadius: '0.5rem', background: 'var(--glass)', border: '1px solid var(--card-border)', color: 'inherit' }}><Filter size={16} /></button>
              <button style={{ padding: '0.625rem', borderRadius: '0.5rem', background: 'var(--glass)', border: '1px solid var(--card-border)', color: 'inherit' }}><ArrowUpRight size={16} /></button>
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
                  <Th></Th>
                </tr>
              </TableHead>
              <tbody>
                {displayedData.map((item, idx) => (
                  <Tr key={item.id + idx}>
                    <Td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'rgba(99, 102, 241, 0.8)' }}>{item.id}</Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'var(--glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', border: '1px solid var(--card-border)' }}>
                          {item.symbol}
                        </div>
                        <span style={{ fontWeight: 500 }}>{item.name}</span>
                      </div>
                    </Td>
                    <Td style={{ fontWeight: 500 }}>${Number(item.value).toLocaleString()}</Td>
                    <Td style={{ textAlign: 'center' }}>
                      <ChangeBadge $negative={item.change.startsWith('-')}>
                        {item.change.startsWith('-') ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                        {Math.abs(Number(item.change))}%
                      </ChangeBadge>
                    </Td>
                    <Td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.region}</Td>
                    <Td>
                      <button style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}><ChevronRight size={16} /></button>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </StyledTable>
            <div ref={observerTarget} style={{ height: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {visibleCount < filteredData.length && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <SpinnerWrapper>
                    <RefreshCw size={12} />
                  </SpinnerWrapper> 
                  Syncing more records...
                </div>
              )}
            </div>
          </TableContainer>
        </LedgerSection>
      </MainContent>
    </Container>
  );
}
