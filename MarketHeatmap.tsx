import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Grid, Bell, Flame, Volume2, VolumeX, AlertTriangle, ShieldCheck, HelpCircle, Sparkles, TrendingUp, TrendingDown } from "lucide-react";

interface MarketHeatmapProps {
  themePreset?: "sapphire" | "champagne" | "hyperneon";
  onSymbolSelect?: (symbol: string) => void;
  activeSymbol?: string;
  onVolatilitySpike?: (
    symbol: string,
    direction: "UP" | "DOWN",
    percent: number,
    newValue: number,
    message: string
  ) => void;
}

interface HeatmapAsset {
  symbol: string;
  display: string;
  strength: number; // -100 to +100
  percentageChange: number;
  volatility: "low" | "medium" | "high";
  bid: number;
  ask: number;
}

interface MarketAlarm {
  id: string;
  symbol: string;
  condition: "ABOVE" | "BELOW";
  targetValue: number;
  isActive: boolean;
  isTriggered: boolean;
  triggeredAt?: string;
}

interface MovementLog {
  id: string;
  symbol: string;
  timestamp: string;
  message: string;
  type: "spike" | "drop" | "reversal" | "breakout";
}

const INITIAL_ASSETS: HeatmapAsset[] = [
  { symbol: "XAUUSD", display: "Gold / USD", strength: 65, percentageChange: 1.24, volatility: "high", bid: 2334.50, ask: 2335.20 },
  { symbol: "EURUSD", display: "Euro / USD", strength: -48, percentageChange: -0.38, volatility: "low", bid: 1.08241, ask: 1.08249 },
  { symbol: "GBPUSD", display: "Pound / USD", strength: 32, percentageChange: 0.55, volatility: "medium", bid: 1.26850, ask: 1.26862 },
  { symbol: "USDJPY", display: "USD / Yen", strength: 80, percentageChange: 0.88, volatility: "high", bid: 157.640, ask: 157.655 },
  { symbol: "AUDUSD", display: "Aussie / USD", strength: 15, percentageChange: 0.22, volatility: "low", bid: 0.66210, ask: 0.66218 },
  { symbol: "USDCAD", display: "USD / CAD", strength: -20, percentageChange: -0.15, volatility: "medium", bid: 1.36820, ask: 1.36831 },
  { symbol: "BTCUSD", display: "Bitcoin / USD", strength: 92, percentageChange: 4.12, volatility: "high", bid: 67120.00, ask: 67128.50 },
  { symbol: "ETHUSD", display: "Ethereum / USD", strength: 74, percentageChange: 2.85, volatility: "high", bid: 3512.40, ask: 3513.10 },
];

export const MarketHeatmap: React.FC<MarketHeatmapProps> = ({
  themePreset = "sapphire",
  onSymbolSelect,
  activeSymbol = "XAUUSD",
  onVolatilitySpike
}) => {
  const [assets, setAssets] = useState<HeatmapAsset[]>(INITIAL_ASSETS);
  const [muted, setMuted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"heatmap" | "alarms" | "logs">("heatmap");
  const [alarms, setAlarms] = useState<MarketAlarm[]>([
    { id: "al1", symbol: "BTCUSD", condition: "ABOVE", targetValue: 68000.0, isActive: true, isTriggered: false },
    { id: "al2", symbol: "XAUUSD", condition: "BELOW", targetValue: 2320.0, isActive: true, isTriggered: false },
    { id: "al3", symbol: "EURUSD", condition: "BELOW", targetValue: 1.08000, isActive: true, isTriggered: false },
  ]);
  const [movementLogs, setMovementLogs] = useState<MovementLog[]>([
    { id: "log-1", symbol: "BTCUSD", timestamp: "09:41:05", message: "Bullish breakout detected near structural channel high.", type: "breakout" },
    { id: "log-2", symbol: "USDJPY", timestamp: "09:35:12", message: "Sudden buyer exhaustion spike triggered potential reversal risk.", type: "reversal" },
  ]);

  // For adding a new alarm
  const [newAlarmSymbol, setNewAlarmSymbol] = useState<string>("XAUUSD");
  const [newAlarmCondition, setNewAlarmCondition] = useState<"ABOVE" | "BELOW">("ABOVE");
  const [newAlarmValue, setNewAlarmValue] = useState<string>("");

  const audioContextRef = useRef<AudioContext | null>(null);

  // Play high fidelity synthesized chime
  const playSynthesizedChime = (frequency: number, type: "sine" | "triangle" = "sine", duration: number = 0.5) => {
    if (muted) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      // Luxurious envelope decay
      gainNode.gain.setValueAtTime(0.18, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context could not start", e);
    }
  };

  // Simulate Auto-detecting Market Movements and Alarms
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Gently mutate asset prices and strengths
      setAssets(prevAssets => {
        return prevAssets.map(asset => {
          const changeRatio = (Math.random() - 0.5) * 0.003; // +- 0.15% fluctuation
          const newBid = asset.bid * (1 + changeRatio);
          const newAsk = asset.ask * (1 + changeRatio);
          
          // Randomly change strength marginally
          let newStrength = asset.strength + Math.floor((Math.random() - 0.5) * 6);
          newStrength = Math.max(-100, Math.min(100, newStrength));

          // Calculate direct performance drift
          const randomDriftPercent = Number((asset.percentageChange + changeRatio * 15).toFixed(2));

          // Chance to trigger sudden high-volatility spike for Alarms detection
          const isSpikeChance = Math.random() > 0.95;
          if (isSpikeChance) {
            const isBullishSpike = Math.random() > 0.4;
            const spikeSize = isBullishSpike ? 0.008 : -0.008;
            const finalBid = newBid * (1 + spikeSize);
            const finalAsk = newAsk * (1 + spikeSize);

            // Append live movement movement log auto detection
            const logType = Math.abs(spikeSize * 100) > 0.5 ? (isBullishSpike ? "spike" : "drop") : "breakout";
            const timestamp = new Date().toTimeString().split(' ')[0];
            const directionLabel = isBullishSpike ? "Bullish Volume Spike" : "Bearish Liquidity Flush";
            const alertMessage = `Automated detection: ${directionLabel} found. Dynamic average delta deviated beyond 2.0σ.`;
            
            // Check alarms instantly
            setTimeout(() => {
              // Trigger parental volatility callback if active symbol matches
              const isUserActiveSymbol = asset.symbol === activeSymbol.toUpperCase().replace('M', '');
              if (isUserActiveSymbol && onVolatilitySpike) {
                onVolatilitySpike(
                  asset.symbol,
                  isBullishSpike ? "UP" : "DOWN",
                  Math.abs(Number((spikeSize * 100).toFixed(2))),
                  isBullishSpike ? finalAsk : finalBid,
                  alertMessage
                );
              }

              setMovementLogs(prevLogs => [
                {
                  id: `log-${Date.now()}-${asset.symbol}-${Math.random().toString(36).substring(2, 9)}`,
                  symbol: asset.symbol,
                  timestamp,
                  message: alertMessage,
                  type: logType as any
                },
                ...prevLogs.slice(0, 19)
              ]);

              // Check if any alarms triggered
              setAlarms(prevAlarms => {
                return prevAlarms.map(al => {
                  if (al.isActive && !al.isTriggered && al.symbol === asset.symbol) {
                    const priceToCheck = isBullishSpike ? finalAsk : finalBid;
                    const isTriggeredNow = al.condition === "ABOVE" 
                      ? priceToCheck >= al.targetValue 
                      : priceToCheck <= al.targetValue;
                    
                    if (isTriggeredNow) {
                      // Trigger audio feedback!
                      playSynthesizedChime(880, "triangle", 0.8);
                      setTimeout(() => playSynthesizedChime(1320, "sine", 0.6), 180);
                      
                      return {
                        ...al,
                        isTriggered: true,
                        isActive: false, // turn off once popped
                        triggeredAt: timestamp
                      };
                    }
                  }
                  return al;
                });
              });
            }, 50);

            return {
              ...asset,
              bid: finalBid,
              ask: finalAsk,
              strength: isBullishSpike ? Math.min(100, asset.strength + 20) : Math.max(-100, asset.strength - 20),
              percentageChange: Number((randomDriftPercent + spikeSize * 100).toFixed(2))
            };
          }

          return {
            ...asset,
            bid: newBid,
            ask: newAsk,
            strength: newStrength,
            percentageChange: randomDriftPercent
          };
        });
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [muted, alarms]);

  // Add custom user alarm
  const handleAddAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlarmValue || isNaN(Number(newAlarmValue))) return;
    
    // Play sweet tick sound
    playSynthesizedChime(700, "sine", 0.25);

    const newAlarm: MarketAlarm = {
      id: `al-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      symbol: newAlarmSymbol,
      condition: newAlarmCondition,
      targetValue: Number(newAlarmValue),
      isActive: true,
      isTriggered: false
    };

    setAlarms(prev => [newAlarm, ...prev]);
    setNewAlarmValue("");
  };

  // Delete Alarm
  const handleDeleteAlarm = (id: string) => {
    playSynthesizedChime(350, "sine", 0.15);
    setAlarms(prev => prev.filter(al => al.id !== id));
  };

  // Color mappings based on Theme Presets
  const isChampagne = themePreset === "champagne";
  const isHyperneon = themePreset === "hyperneon";

  const themeText = isChampagne ? "text-amber-400" : isHyperneon ? "text-fuchsia-400" : "text-blue-400";
  const themeGlow = isChampagne ? "shadow-[0_0_20px_rgba(245,158,11,0.18)]" : isHyperneon ? "shadow-[0_0_20px_rgba(232,121,249,0.22)]" : "shadow-[0_0_20px_rgba(59,130,246,0.14)]";
  const themeBorder = isChampagne ? "border-amber-500/10" : isHyperneon ? "border-fuchsia-500/10" : "border-white/5";
  const themeBg = isChampagne ? "bg-[#14110C]" : isHyperneon ? "bg-[#110A18]" : "bg-[#0F1117]";
  const themeAccentBg = isChampagne ? "bg-amber-500/10" : isHyperneon ? "bg-fuchsia-500/10" : "bg-blue-500/10";
  const themeHeaderBg = isChampagne ? "bg-[#0D0B07]/90" : isHyperneon ? "bg-[#09050C]/90" : "bg-[#0A0B10]/95";
  const themeInputFocus = isChampagne ? "focus:border-amber-500/60" : isHyperneon ? "focus:border-fuchsia-500/60" : "focus:border-blue-500/60";
  const themeBtn = isChampagne ? "bg-amber-600 hover:bg-amber-500 text-black font-black" : isHyperneon ? "bg-fuchsia-600 hover:bg-fuchsia-500 text-white" : "bg-blue-600 hover:bg-blue-500 text-white";

  // Compute thermal block styling dynamically
  const getThermalClass = (strength: number) => {
    if (strength >= 60) return "bg-emerald-500/20 border-emerald-500/30 text-emerald-300";
    if (strength >= 15) return "bg-emerald-500/10 border-emerald-500/15 text-emerald-400/90";
    if (strength <= -60) return "bg-rose-500/20 border-rose-500/30 text-rose-300";
    if (strength <= -15) return "bg-rose-500/10 border-rose-500/15 text-rose-400/90";
    return "bg-white/[0.03] border-white/5 text-white/70";
  };

  return (
    <div className={`${themeBg} border ${themeBorder} ${themeGlow} rounded-2xl overflow-hidden flex flex-col h-full min-h-[440px] transition-all duration-300`}>
      {/* Upper bar with dynamic controls */}
      <div className={`px-5 py-3.5 border-b ${themeBorder} flex items-center justify-between ${themeHeaderBg} transition-all`}>
        <div className="flex items-center gap-2">
          <Grid className={`h-4.5 w-4.5 ${themeText} animate-pulse`} />
          <div>
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-[#E0E0E6]">
              Thermal Strength Matrix & Alarms
            </h3>
            <p className="text-[10px] text-white/40 font-mono">
              Market deviation models • Level monitoring
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Mute toggle */}
          <button
            onClick={() => {
              setMuted(!muted);
              if (muted) playSynthesizedChime(800, "sine", 0.15);
            }}
            className="p-1 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white/50 hover:text-white transition-all flex items-center gap-1 cursor-pointer text-[10px] font-bold"
            title={muted ? "Unmute alarms" : "Mute alarms"}
          >
            {muted ? <VolumeX className="h-3 w-3 text-rose-400" /> : <Volume2 className="h-3 w-3 text-emerald-400" />}
            <span className="hidden sm:inline">{muted ? "MUTED" : "AUDIO"}</span>
          </button>
        </div>
      </div>

      {/* Mode selectors */}
      <div className="flex border-b border-white/5 bg-black/20 p-1">
        <button
          onClick={() => setActiveTab("heatmap")}
          className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === "heatmap"
              ? isChampagne ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : isHyperneon ? "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
              : "text-white/40 hover:text-white/80"
          }`}
        >
          Heatmap Grid
        </button>
        <button
          onClick={() => setActiveTab("alarms")}
          className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg relative transition-all cursor-pointer ${
            activeTab === "alarms"
              ? isChampagne ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : isHyperneon ? "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
              : "text-white/40 hover:text-white/80"
          }`}
        >
          Alarms Center
          {alarms.some(al => al.isActive) && (
            <span className="absolute top-1.5 right-3 flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === "logs"
              ? isChampagne ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : isHyperneon ? "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
              : "text-white/40 hover:text-white/80"
          }`}
        >
          Movement Logs
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto max-h-[380px] custom-scrollbar bg-black/10">
        <AnimatePresence mode="wait">
          {activeTab === "heatmap" && (
            <motion.div
              key="heatmap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between text-[10.5px] text-white/50 font-mono font-bold tracking-wider">
                <span>INTENSITY RATING BY SECTOR strength</span>
                <span className="text-white/30 hover:text-white/50 cursor-pointer flex items-center gap-1" onClick={() => playSynthesizedChime(1100, "sine", 0.15)}>
                  <Sparkles className="h-3 w-3 text-yellow-400 animate-spin-slow" /> Relative Index Weighting
                </span>
              </div>

              {/* Grid map */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {assets.map((asset) => {
                  const thermal = getThermalClass(asset.strength);
                  const isCurrent = activeSymbol.toUpperCase().replace('M', '') === asset.symbol;
                  
                  return (
                    <motion.div
                      key={asset.symbol}
                      whileHover={{ scale: 1.025, y: -2 }}
                      onClick={() => onSymbolSelect?.(asset.symbol)}
                      className={`p-3 rounded-xl border ${thermal} transition-all cursor-pointer relative group flex flex-col justify-between h-[92px] ${
                        isCurrent 
                          ? isChampagne ? "ring-2 ring-amber-500 border-amber-400/80 bg-amber-500/10" : isHyperneon ? "ring-2 ring-fuchsia-500 border-fuchsia-400/80 bg-fuchsia-500/10" : "ring-2 ring-blue-500 border-blue-400/80 bg-blue-500/10" 
                          : ""
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-black tracking-wider text-white font-mono">{asset.symbol}</span>
                          <span className={`text-[9px] font-bold font-mono px-1 py-0.2 rounded bg-black/20 ${asset.percentageChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {asset.percentageChange >= 0 ? "+" : ""}{asset.percentageChange}%
                          </span>
                        </div>
                        <span className="text-[9.5px] text-white/40 block whitespace-nowrap overflow-hidden text-ellipsis leading-tight mt-0.5">{asset.display}</span>
                      </div>
                      
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-[11px] font-mono font-bold tracking-tight text-white/90">
                          {asset.bid.toLocaleString(undefined, { minimumFractionDigits: asset.symbol.includes("USD") && !asset.symbol.includes("BTC") && !asset.symbol.includes("ETH") && !asset.symbol.includes("XAU") ? 5 : 2 })}
                        </span>
                        <span className="text-[8.5px] uppercase font-mono px-1 bg-white/5 border border-white/5 rounded text-white/30">
                          S: {asset.strength > 0 ? "+" : ""}{asset.strength}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Informative footer */}
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between text-[11px] text-white/55">
                <div className="flex items-center gap-1.5 text-white/50">
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  <span>Click blocks to switch active workspace pair</span>
                </div>
                <span className="text-white/30 font-mono text-[10px]">Matrix sync real-time</span>
              </div>
            </motion.div>
          )}

          {activeTab === "alarms" && (
            <motion.div
              key="alarms"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Add alarm form block */}
              <form onSubmit={handleAddAlarm} className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                <div className="text-[10.5px] font-bold text-white/60 tracking-wider">PRECISE SYSTEM ALARM SETTINGS</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Select Symbol */}
                  <div>
                    <label className="block text-[9px] text-white/40 mb-1 font-mono">ASSET</label>
                    <select
                      value={newAlarmSymbol}
                      onChange={(e) => setNewAlarmSymbol(e.target.value)}
                      className={`w-full text-xs font-bold bg-white/5 border ${themeBorder} rounded-lg py-1.5 px-2.5 text-white focus:outline-none focus:bg-[#0A0B10]`}
                    >
                      {assets.map(as => (
                        <option key={as.symbol} value={as.symbol} className="bg-[#0F1117]">{as.symbol}</option>
                      ))}
                    </select>
                  </div>

                  {/* Condition Type */}
                  <div>
                    <label className="block text-[9px] text-white/40 mb-1 font-mono">CONDITION</label>
                    <select
                      value={newAlarmCondition}
                      onChange={(e) => setNewAlarmCondition(e.target.value as any)}
                      className={`w-full text-xs font-bold bg-white/5 border ${themeBorder} rounded-lg py-1.5 px-2.5 text-white focus:outline-none focus:bg-[#0F1117]`}
                    >
                      <option value="ABOVE" className="bg-[#0C0F17]">PRICE ABOVE</option>
                      <option value="BELOW" className="bg-[#0C0F17]">PRICE BELOW</option>
                    </select>
                  </div>

                  {/* Target Value */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[9px] text-white/40 mb-1 font-mono">TARGET VALUE</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 2350.50"
                      value={newAlarmValue}
                      onChange={(e) => setNewAlarmValue(e.target.value)}
                      className={`w-full text-xs font-bold bg-white/5 border ${themeBorder} rounded-lg py-1.5 px-2.5 text-white ${themeInputFocus} focus:outline-none`}
                      required
                    />
                  </div>

                  {/* Add action */}
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className={`w-full text-xs font-bold py-1.5 rounded-lg ${themeBtn} hover:scale-[1.02] active:scale-95 transition-all text-center cursor-pointer`}
                    >
                      ACTIVATE ALARM
                    </button>
                  </div>
                </div>
              </form>

              {/* Alarm listing list */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-mono tracking-widest text-white/40 font-bold flex items-center gap-1">
                  <Bell className="h-3.5 w-3.5" /> Activated monitoring scopes
                </div>

                <div className="max-h-[160px] overflow-y-auto space-y-2 custom-scrollbar pr-1">
                  {alarms.map((al) => {
                    return (
                      <div
                        key={al.id}
                        className={`p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs transition-colors bg-white/[0.015] ${
                          al.isTriggered ? "bg-rose-500/5 border-rose-500/20" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {al.isTriggered ? (
                            <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                          ) : (
                            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          )}
                          <div>
                            <span className="text-white font-bold font-mono mr-1">{al.symbol}</span>
                            <span className="text-white/40 text-[11px] font-mono uppercase">IF price goes</span>
                            <span className={`ml-1 font-extrabold uppercase ${al.condition === "ABOVE" ? "text-emerald-400" : "text-rose-400"}`}>
                              {al.condition === "ABOVE" ? "≥" : "≤"} {al.targetValue.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {al.isTriggered ? (
                            <span className="text-[9.5px] font-mono text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded">
                              BREACHED AT {al.triggeredAt}
                            </span>
                          ) : (
                            <span className="text-[9.5px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                              ACTIVE
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteAlarm(al.id)}
                            className="bg-white/5 hover:bg-white/10 hover:text-white text-white/40 text-[10px] font-bold p-1 px-2 border border-white/10 rounded transition-colors"
                          >
                            REMOVE
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {alarms.length === 0 && (
                    <div className="text-center py-6 text-white/30 text-xs italic">
                      Zero parameters active. Define an alarm above to receive alerts.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "logs" && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2.5"
            >
              <div className="text-[10px] uppercase font-mono tracking-widest text-[#E0E0E6]/50 font-bold flex items-center justify-between">
                <span>SYSTEM DETECTED ABNORMAL SCALES</span>
                <span className="text-white/30 text-[9px] font-normal uppercase">Filtered live ticks</span>
              </div>

              <div className="max-h-[190px] overflow-y-auto space-y-2 custom-scrollbar pr-1">
                {movementLogs.map((log) => {
                  return (
                    <div key={log.id} className="p-2.5 rounded-lg border border-white/5 bg-white/[0.012] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-start gap-2 max-w-[80%]">
                        <span className={`text-[8px] uppercase px-1.5 py-0.2 rounded font-mono font-black border tracking-widest leading-normal mt-0.5 shrink-0 ${
                          log.type === "spike"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                            : log.type === "drop"
                              ? "bg-rose-500/15 text-rose-400 border-rose-500/20"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/15"
                        }`}>
                          {log.type}
                        </span>
                        <div>
                          <span className="font-extrabold text-white mr-1 font-mono">{log.symbol}:</span>
                          <span className="text-white/70">{log.message}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-white/30 font-semibold self-end sm:self-auto shrink-0">{log.timestamp}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
