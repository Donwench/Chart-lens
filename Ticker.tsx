import React, { useState, useEffect } from "react";
import { Radio, RefreshCw, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface TickerProps {
  symbol: string;
  themePreset?: "sapphire" | "champagne" | "hyperneon";
}

interface Headline {
  id: string;
  text: string;
  impact: "high" | "medium" | "low";
  timestamp: string;
  change?: string;
  isUp?: boolean;
}

const MOCK_HEADLINES: Record<string, Headline[]> = {
  XAUUSD: [
    { id: "g1", text: "Gold defends key $2,330/oz support amid rising safe-haven demand.", impact: "high", timestamp: "5m ago", change: "+1.24%", isUp: true },
    { id: "g2", text: "Intraday volume spikes on XAUUSD near major Asian range liquidity sweeps.", impact: "medium", timestamp: "18m ago", change: "+0.45%", isUp: true },
    { id: "g3", text: "Spot gold buyers target dynamic 200 EMA breakout targets on daily charts.", impact: "medium", timestamp: "42m ago", change: "+0.85%", isUp: true },
    { id: "g4", text: "Physical bullion premiums swell in Asian hubs, shielding current price levels.", impact: "low", timestamp: "1h ago" },
    { id: "g5", text: "Federal Reserve commentary on interest rates triggers swift gold mean reversion.", impact: "high", timestamp: "2h ago", change: "-0.62%", isUp: false },
  ],
  EURUSD: [
    { id: "e1", text: "ECB policy divergence alerts trigger EURUSD liquidity sweeps near 1.0820.", impact: "high", timestamp: "3m ago", change: "-0.38%", isUp: false },
    { id: "e2", text: "Eurozone PMI prints slightly above consensus, bolstering buyer interest.", impact: "medium", timestamp: "15m ago", change: "+0.15%", isUp: true },
    { id: "e3", text: "EURUSD price action consolidates near key London session order block.", impact: "low", timestamp: "35m ago" },
    { id: "e4", text: "CFTC COT data confirms institutional traders trimming Euro long positions.", impact: "medium", timestamp: "1h ago", change: "-0.22%", isUp: false },
    { id: "e5", text: "German industrial output stalls, caps major bullish breakout potential.", impact: "high", timestamp: "3h ago", change: "-0.11%", isUp: false },
  ],
  GBPUSD: [
    { id: "b1", text: "BOE hawkish stance fuels sudden Cable breakout above daily EMA stack.", impact: "high", timestamp: "8m ago", change: "+0.55%", isUp: true },
    { id: "b2", text: "UK retail sales beat projections, driving GBPUSD toward higher ranges.", impact: "medium", timestamp: "22m ago", change: "+0.32%", isUp: true },
    { id: "b3", text: "GBPUSD buyers trigger heavy buy stops above Asian Session consolidation high.", impact: "low", timestamp: "55m ago" },
    { id: "b4", text: "Sovereign flows in London morning window defend key support lines.", impact: "medium", timestamp: "2h ago", change: "+0.12%", isUp: true },
  ],
  USDJPY: [
    { id: "j1", text: "BOJ intervention alarm sounds as USDJPY pierces historical resistance zones.", impact: "high", timestamp: "2m ago", change: "+0.88%", isUp: true },
    { id: "j2", text: "Tokyo inflation metrics fuel aggressive speculation on future rate hikes.", impact: "medium", timestamp: "12m ago", change: "-0.40%", isUp: false },
    { id: "j3", text: "USDJPY risk reversals reach monthly highs, signaling options exhaustion.", impact: "medium", timestamp: "48m ago" },
    { id: "j4", text: "Yen squeeze sends USDJPY tumbling back to local M15 EMA support anchors.", impact: "low", timestamp: "1h ago", change: "-0.25%", isUp: false },
  ],
  AUDUSD: [
    { id: "a1", text: "Aussie dollar gains traction as copper and metal commodities hit swing lows.", impact: "medium", timestamp: "10m ago", change: "+0.64%", isUp: true },
    { id: "a2", text: "RBA meeting minutes signal restrictive rates policy to persist for several quarters.", impact: "high", timestamp: "30m ago", change: "+0.22%", isUp: true },
    { id: "a3", text: "AUDUSD order flow tracks gold breakout; resistance target looms at 0.6680.", impact: "low", timestamp: "1h ago" },
    { id: "a4", text: "Retail margin accounts boost short exposure on Australian Dollar rally.", impact: "medium", timestamp: "2h ago", change: "+0.41%", isUp: true },
  ],
  USDCAD: [
    { id: "c1", text: "Loonie tracks crude volatility inside tight 50-pip horizontal range.", impact: "medium", timestamp: "4m ago", change: "-0.15%", isUp: false },
    { id: "c2", text: "USDCAD breakout attempt stalls at previous daily High key level.", impact: "high", timestamp: "19m ago", change: "-0.30%", isUp: false },
    { id: "c3", text: "Canadian retail data surprise triggers rapid scalper pullbacks toward weekly pivot.", impact: "low", timestamp: "1h ago" },
    { id: "c4", text: "Oil price consolidation limits USDCAD direction; ranges bound by Bollinger bands.", impact: "medium", timestamp: "2h ago", change: "+0.08%", isUp: true },
  ],
  BTCUSD: [
    { id: "bt1", text: "Bitcoin open interest surges to monthly highs; major liquidation pool targets.", impact: "high", timestamp: "1m ago", change: "+4.12%", isUp: true },
    { id: "bt2", text: "Institutional spot ETF flows accelerate; spot buyers absorb major supply walls.", impact: "high", timestamp: "14m ago", change: "+3.20%", isUp: true },
    { id: "bt3", text: "On-chain transaction fees contract; swing low accumulation structures solidifying.", impact: "medium", timestamp: "40m ago" },
    { id: "bt4", text: "BTCUSD prints range breakout confirmation on the hourly timeframe.", impact: "medium", timestamp: "1h ago", change: "+2.50%", isUp: true },
    { id: "bt5", text: "Short-term holders capitulate near prior monthly structure highs.", impact: "low", timestamp: "3h ago" },
  ],
  ETHUSD: [
    { id: "et1", text: "Ethereum developer activity spikes; key gas mechanics trigger bullish pivot.", impact: "high", timestamp: "6m ago", change: "+2.85%", isUp: true },
    { id: "et2", text: "ETHUSD buyers aggressively absorb limit orders preceding London sessions.", impact: "medium", timestamp: "20m ago", change: "+1.90%", isUp: true },
    { id: "et3", text: "Smart contract inflow hits 30-day highs, squeezing structural shorts.", impact: "medium", timestamp: "50m ago" },
    { id: "et4", text: "Ethereum validators lock record supply; circulating reserves drop sharply.", impact: "low", timestamp: "2h ago", change: "+0.95%", isUp: true },
  ],
};

const DEFAULT_NEWS: Headline[] = [
  { id: "def1", text: "Global financial liquidity index surges, supporting broad risk assets.", impact: "medium", timestamp: "10m ago" },
  { id: "def2", text: "Market participant sentiment indexes tilt toward defensive range containment.", impact: "low", timestamp: "25m ago" },
  { id: "def3", text: "Automated trading volume sets multi-session record on New York Open.", impact: "high", timestamp: "45m ago" },
];

export const Ticker: React.FC<TickerProps> = ({ symbol, themePreset = "sapphire" }) => {
  const [headlines, setHeadlines] = useState<Headline[]>(DEFAULT_NEWS);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>("Initializing...");

  // Normalize Symbol
  const normalizedSymbol = symbol.toUpperCase().replace('M', '');

  // Simulate active Mock API fetch with Loading UX
  useEffect(() => {
    setLoading(true);
    setLastUpdated("Fetching...");

    const timer = setTimeout(() => {
      const liveData = MOCK_HEADLINES[normalizedSymbol] || DEFAULT_NEWS;
      setHeadlines(liveData);
      setLoading(false);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 450); // Premium brief loading transition

    return () => clearTimeout(timer);
  }, [normalizedSymbol]);

  // Color mappings matching three theme presets
  const isChampagne = themePreset === "champagne";
  const isHyperneon = themePreset === "hyperneon";

  const bannerBg = isChampagne 
    ? "bg-[#0A0906] border-amber-500/10" 
    : isHyperneon 
      ? "bg-[#060309] border-fuchsia-500/10" 
      : "bg-[#090A0D] border-blue-500/10";
  
  const accentText = isChampagne 
    ? "text-amber-400" 
    : isHyperneon 
      ? "text-fuchsia-400" 
      : "text-blue-400";

  const liveDotBg = isChampagne 
    ? "bg-amber-400" 
    : isHyperneon 
      ? "bg-fuchsia-400" 
      : "bg-blue-400";

  return (
    <div className={`w-full ${bannerBg} border-b text-[11px] font-medium py-1.5 px-4 flex items-center justify-between select-none overflow-hidden relative z-20`}>
      {/* CSS infinite animation styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .marquee-container {
          display: flex;
          width: max-content;
          animation: marquee 45s linear infinite;
        }
        .marquee-container:hover {
          animation-play-state: paused;
        }
      `}} />

      {/* Symbol Tag Label */}
      <div className="flex items-center gap-2 pr-3 border-r border-white/5 shrink-0 bg-inherit z-10">
        <div className="relative">
          <span className={`flex h-2 w-2 rounded-full ${liveDotBg} ${loading ? 'animate-ping' : 'animate-pulse'}`} />
        </div>
        <span className={`text-[9.5px] uppercase font-mono font-black ${accentText} tracking-widest flex items-center gap-1`}>
          <Radio className="h-3 w-3 animate-pulse" />
          LIVE:{normalizedSymbol}
        </span>
      </div>

      {/* Scrolling Content Feed */}
      <div className="flex-1 overflow-hidden relative mx-3 flex items-center">
        {loading ? (
          <div className="flex items-center gap-1.5 text-white/40 italic font-mono text-[10px] animate-pulse">
            <RefreshCw className="h-2.5 w-2.5 animate-spin text-white/30" />
            Synchronizing neural-market news wire...
          </div>
        ) : (
          <div className="marquee-container flex gap-16 py-0.5">
            {/* Render twice for seamless continuous loop */}
            {[1, 2].map((loopIndex) => (
              <div key={loopIndex} className="flex gap-16 items-center">
                {headlines.map((item, idx) => {
                  const impactColor = item.impact === "high" 
                    ? isChampagne ? "text-amber-300" : isHyperneon ? "text-fuchsia-300" : "text-blue-300"
                    : "text-[#E0E0E6]/90";
                  
                  return (
                    <div key={`${item.id}-${loopIndex}-${idx}`} className="flex items-center gap-2 whitespace-nowrap cursor-help group/item">
                      {/* Impact badge indicator */}
                      <span className={`text-[8.5px] uppercase px-1.5 py-0.2 md:py-0.5 rounded font-mono font-black border text-center leading-none tracking-widest ${
                        item.impact === "high"
                          ? "bg-rose-500/15 text-rose-400 border-rose-500/20"
                          : item.impact === "medium"
                            ? isChampagne ? "bg-amber-500/10 text-amber-400 border-amber-500/15" : isHyperneon ? "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/15" : "bg-blue-500/10 text-blue-400 border-blue-500/15"
                            : "bg-white/5 text-white/50 border-white/5"
                      }`}>
                        {item.impact}
                      </span>
                      
                      {/* Headline Text */}
                      <span className={`text-[11px] font-sans hover:underline ${impactColor}`}>
                        {item.text}
                      </span>

                      {/* Yield change indicator */}
                      {item.change && (
                        <span className={`inline-flex items-center text-[10px] font-mono font-extrabold ${item.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.isUp ? <ArrowUpRight className="h-3 w-3 shrink-0" /> : <ArrowDownRight className="h-3 w-3 shrink-0" />}
                          {item.change}
                        </span>
                      )}

                      {/* Timestamp */}
                      <span className="text-[9px] font-mono text-white/30 font-semibold">{item.timestamp}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sync Status Badge */}
      <div className="pl-3 border-l border-white/5 shrink-0 bg-inherit z-10 flex items-center gap-1.5 font-mono text-[9px] text-white/50">
        <span className="hidden md:inline text-white/30">UPDATED:</span>
        <span className="text-white/60 font-bold">{lastUpdated}</span>
      </div>
    </div>
  );
};
