import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { STRATEGIES, SUPPORTED_SYMBOLS, TIMEFRAMES } from "../data";
import { PositionSizeResult, generateMql5Code, formatMoney, calculatePositionStats } from "../utils";
import { SavedSetup } from "../types";
import {
  TrendingUp,
  TrendingDown,
  Percent,
  DollarSign,
  Copy,
  Plus,
  Compass,
  AlertTriangle,
  Flame,
  CheckCircle2,
  FileCode2,
  Edit3,
  RefreshCw,
  Award,
  TrendingUp as WinIcon,
  Target,
  Zap,
  Send,
} from "lucide-react";
import { TelegramService } from "../services/TelegramService";

interface DashboardProps {
  symbol: string;
  onSymbolChange: (newSymbol: string) => void;
  timeframe: string;
  onTimeframeChange: (newTf: string) => void;
  strategyId: string;
  onStrategyChange: (newStrategyId: string) => void;
  direction: 'BUY' | 'SELL' | 'NO_TRADE';
  onDirectionChange: (newDirection: 'BUY' | 'SELL' | 'NO_TRADE') => void;
  regime: string;
  onRegimeChange: (newRegime: string) => void;
  entry: number;
  onEntryChange: (val: number) => void;
  sl: number;
  onSlChange: (val: number) => void;
  tp1: number;
  onTp1Change: (val: number) => void;
  tp2: number;
  onTp2Change: (val: number) => void;

  balance: number;
  onBalanceChange: (val: number) => void;
  riskPct: number;
  onRiskPctChange: (val: number) => void;

  positionStats: PositionSizeResult;
  explanation: string;
  onExplanationChange: (text: string) => void;
  onSaveToJournal: (status: 'pending' | 'success_tp1' | 'success_tp2' | 'failed_sl') => void;
  isSaving: boolean;
  hasAnalyzed: boolean;
  themePreset?: "sapphire" | "champagne" | "hyperneon";
  savedSetups: SavedSetup[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  symbol,
  onSymbolChange,
  timeframe,
  onTimeframeChange,
  strategyId,
  onStrategyChange,
  direction,
  onDirectionChange,
  regime,
  onRegimeChange,
  entry,
  onEntryChange,
  sl,
  onSlChange,
  tp1,
  onTp1Change,
  tp2,
  onTp2Change,
  balance,
  onBalanceChange,
  riskPct,
  onRiskPctChange,
  positionStats,
  explanation,
  onExplanationChange,
  onSaveToJournal,
  isSaving,
  hasAnalyzed,
  themePreset = "sapphire",
  savedSetups,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [mqlOpen, setMqlOpen] = useState(false);

  // Telegram auto forwarding state
  const [telegramForwarding, setTelegramForwarding] = useState(() => {
    return localStorage.getItem("telegram_forwarding") === "true";
  });

  const handleToggleForwarding = () => {
    const newVal = !telegramForwarding;
    setTelegramForwarding(newVal);
    localStorage.setItem("telegram_forwarding", String(newVal));
  };

  const [dailyProfitGoal, setDailyProfitGoal] = useState(() => {
    return Number(localStorage.getItem("daily_profit_goal") || "1000");
  });
  
  const [targetResult, setTargetResult] = useState<'pending' | 'success_tp1' | 'success_tp2' | 'failed_sl'>('pending');

  const handleSetGoal = (val: number) => {
    const newVal = Math.max(10, val);
    setDailyProfitGoal(newVal);
    localStorage.setItem("daily_profit_goal", String(newVal));
  };

  const totalRealizedProfit = React.useMemo(() => {
    const arr = savedSetups || [];
    return arr.reduce((sum, s) => {
      if (!s.status || s.status === 'pending') return sum;
      
      const stats = calculatePositionStats(
        s.symbol,
        s.entry,
        s.sl,
        s.tp1,
        s.tp2,
        s.balance,
        s.riskPct,
        s.direction
      );
      
      if (s.status === 'success_tp1') return sum + stats.potentialTp1Usd;
      if (s.status === 'success_tp2') return sum + stats.potentialTp2Usd;
      if (s.status === 'failed_sl') return sum - stats.riskAmount;
      return sum;
    }, 0);
  }, [savedSetups]);

  const realizedWinsCount = (savedSetups || []).filter(s => s.status === 'success_tp1' || s.status === 'success_tp2').length;
  const realizedLossesCount = (savedSetups || []).filter(s => s.status === 'failed_sl').length;

  const isChampagne = themePreset === "champagne";
  const isHyperneon = themePreset === "hyperneon";

  const themeText = isChampagne ? "text-amber-400" : isHyperneon ? "text-fuchsia-400" : "text-blue-400";
  const themeAccentBg = isChampagne ? "bg-amber-500/10" : isHyperneon ? "bg-fuchsia-500/10" : "bg-blue-500/10";
  const themeAccentBorder = isChampagne ? "border-amber-500/20" : isHyperneon ? "border-fuchsia-500/20" : "border-white/10";
  const themeBg = isChampagne ? "bg-[#14110C]" : isHyperneon ? "bg-[#110A18]" : "bg-[#0F1117]";
  const themeBorder = isChampagne ? "border-amber-500/10" : isHyperneon ? "border-fuchsia-500/10" : "border-white/5";
  const themeHeaderBg = isChampagne ? "bg-[#0D0B07]/80" : isHyperneon ? "bg-[#09050C]/80" : "bg-[#0A0B10]/80";
  const themeGlow = isChampagne ? "shadow-[0_0_20px_rgba(245,158,11,0.15)]" : isHyperneon ? "shadow-[0_0_20px_rgba(232,121,249,0.15)]" : "shadow-[0_0_20px_rgba(59,130,246,0.12)]";
  const themeBtn = isChampagne ? "bg-amber-600 hover:bg-amber-500 text-[#0D0B07] font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.3)]" : isHyperneon ? "bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(232,121,249,0.3)]" : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]";
  const themeInputFocus = isChampagne ? "focus:border-amber-500/60" : isHyperneon ? "focus:border-fuchsia-500/60" : "focus:border-blue-500/60";

  const cleanSymbol = symbol.toUpperCase().replace('M', ''); // Standardize EURUSD
  const spec = SUPPORTED_SYMBOLS[cleanSymbol] || { digits: 5, display: symbol, contractSize: 100000, type: "forex" };
  const currentStrategy = STRATEGIES.find((s) => s.id === strategyId) || STRATEGIES[0];

  const handleCopyCode = () => {
    const code = generateMql5Code(
      symbol,
      direction,
      positionStats.lots,
      entry,
      sl,
      tp1,
      tp2,
      currentStrategy.name
    );
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveWithTelegram = async () => {
    onSaveToJournal(targetResult);
    
    if (telegramForwarding && TelegramService.isAutoForwardingEnabled()) {
      const chatId = TelegramService.getSelectedChatId();
      if (chatId) {
        const msg = `📓 *Journal Entry Added - ${symbol}* 📓\n\n` +
                    `*Direction:* ${direction}\n` +
                    `*Strategy:* ${currentStrategy.name}\n` +
                    `*Timeframe:* ${timeframe}\n` +
                    `*Status:* ${targetResult}\n\n` +
                    `*Entry:* ${entry}\n` +
                    `*SL:* ${sl}\n` +
                    `*TP1:* ${tp1} (Potential: +$${positionStats.potentialTp1Usd.toFixed(2)})\n` +
                    `*TP2:* ${tp2} (Potential: +$${positionStats.potentialTp2Usd.toFixed(2)})\n\n` +
                    `*Risk Amount:* $${positionStats.riskAmount.toFixed(2)}\n\n` +
                    `_Analysis Note:_ ${explanation || "No notes provided."}`;
        
        await TelegramService.sendAlert(chatId, msg);
      } else {
        alert("Telegram Forwarding is enabled but no chat is selected. Go to Scanner to set up your Telegram chat!");
      }
    }
  };

  const isBuy = direction === "BUY";
  const isSell = direction === "SELL";

  return (
    <motion.div layout className="space-y-6">
      {/* 🏆 premium dashboard banner header containing daily profit target tracker */}
      <motion.div
        layout
        layoutId="dashboard-banner-tracker"
        className={`${themeBg} border ${themeBorder} ${themeGlow} rounded-2xl p-6 relative overflow-hidden group transition-all duration-300`}
      >
        {/* Background futuristic tech mesh accent */}
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-blue-500/[0.03] to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between relative z-10">
          
          {/* Section 1: Dashboard Welcome and Motivation */}
          <div className="flex-1 space-y-1 text-center md:text-left">
            <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
              isChampagne 
                ? "bg-amber-500/10 text-amber-400" 
                : isHyperneon 
                  ? "bg-fuchsia-500/10 text-fuchsia-400" 
                  : "bg-blue-500/10 text-blue-400"
            }`}>
              <Zap className="h-3 w-3 animate-pulse" />
              INTELLIGENT TRADE MONITORING
            </span>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center justify-center md:justify-start gap-1.5">
              PROFIT <span className={themeText}>TARGET</span> TRACKER
            </h2>
            <p className="text-xs text-white/50 max-w-md leading-relaxed">
              Define your daily target goal, trace your simulated or live-journaled executions, and observe your percentage yield in real-time.
            </p>
          </div>

          {/* Section 2: Interactive Goal Control */}
          <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-2.5 min-w-[210px] w-full md:w-auto">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-white/40 tracking-wider">
              <span>Set Daily Goal (USD)</span>
              <span className={`font-mono font-black ${themeText}`}>${dailyProfitGoal.toLocaleString()}</span>
            </div>
            
            {/* Quick Presets */}
            <div className="grid grid-cols-5 gap-1">
              {[250, 500, 1005, 2500, 5000].map((preset) => {
                const displayVal = preset === 1005 ? 1000 : preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSetGoal(displayVal)}
                    className={`text-[9px] font-bold py-1 rounded transition-all cursor-pointer text-center ${
                      dailyProfitGoal === displayVal
                        ? isChampagne
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black"
                          : isHyperneon
                            ? "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 font-black"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30 font-black"
                        : "bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-transparent"
                    }`}
                  >
                    ${displayVal >= 1000 ? `${displayVal/1000}k` : displayVal}
                  </button>
                );
              })}
            </div>

            {/* Custom Input control */}
            <div className="flex items-center gap-1.5">
              <input
                type="range"
                min="50"
                max="10000"
                step="50"
                value={dailyProfitGoal}
                onChange={(e) => handleSetGoal(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 text-blue-500 focus:outline-none"
              />
              <input
                type="number"
                value={dailyProfitGoal}
                onChange={(e) => handleSetGoal(Number(e.target.value) || 0)}
                className={`w-16 text-center text-[10.5px] py-1 bg-black/50 border ${themeBorder} rounded text-white focus:outline-none ${themeInputFocus} font-mono`}
              />
            </div>
          </div>

          {/* Section 3: Ring progress visualizer */}
          <div className="flex items-center gap-5 p-4 bg-black/20 rounded-xl border border-white/5 w-full md:w-auto shrink-0 justify-center md:justify-start">
            
            {/* Circular Progress Circle */}
            <div className="relative flex items-center justify-center w-[84px] h-[84px] shrink-0">
              <svg className="w-full h-full -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="42"
                  cy="42"
                  r="34"
                  className="stroke-white/[0.05]"
                  strokeWidth="6"
                  fill="transparent"
                />
                {/* Progress Ring with specific preset colors */}
                <circle
                  cx="42"
                  cy="42"
                  r="34"
                  className={`${
                    isChampagne 
                      ? "stroke-amber-500" 
                      : isHyperneon 
                        ? "stroke-fuchsia-500" 
                        : "stroke-blue-500"
                  } transition-all duration-500`}
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${
                    (2 * Math.PI * 34) - 
                    (Math.min(100, Math.max(0, totalRealizedProfit / (dailyProfitGoal || 1))) * (2 * Math.PI * 34))
                  }`}
                  strokeLinecap="round"
                />
              </svg>
              {/* Overlay percentage text */}
              <div className="absolute flex flex-col items-center">
                <span className="text-xs font-black text-white leading-none">
                  {Math.round((totalRealizedProfit / (dailyProfitGoal || 1)) * 100)}%
                </span>
                <span className="text-[7px] uppercase tracking-wider text-white/40 font-mono mt-0.5">
                  PROGRESS
                </span>
              </div>
            </div>

            {/* Accompanying Stats Details */}
            <div className="space-y-1 min-w-[120px]">
              <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Net Realized Profit</div>
              <div className={`text-base font-black flex items-baseline gap-1 leading-none ${
                totalRealizedProfit >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}>
                <span>{totalRealizedProfit >= 0 ? "+" : ""}${Math.round(totalRealizedProfit).toLocaleString()}</span>
                <span className="text-[10px] text-white/30 font-normal font-mono">USD</span>
              </div>
              <div className="flex flex-col gap-0.5 text-[9.5px] text-white/45 font-mono pt-1">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Wins: <span className="text-white font-bold">{realizedWinsCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                  Losses: <span className="text-white font-bold">{realizedLossesCount}</span>
                </div>
                <div className="text-[8px] text-white/35">
                  Goal Status: {totalRealizedProfit >= dailyProfitGoal ? "Completed 🎉" : "Active 📈"}
                </div>
              </div>
            </div>

          </div>

        </div>
      </motion.div>

      {/* Risk Sizing & LOT Parameters Box conforming to Immersive UI */}
      <motion.div layout layoutId="dashboard-top-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Account Balance Card */}
        <motion.div
          layout
          layoutId="db-account-balance"
          className={`${themeBg} border ${themeBorder} ${themeGlow} rounded-xl p-5 relative overflow-hidden group`}
        >
          <div className="absolute right-3 top-3 opacity-10 text-emerald-400 group-hover:scale-110 transition-transform">
            <DollarSign className="h-10 w-10" />
          </div>
          <label className="text-[11px] text-white/50 block mb-1 uppercase tracking-wider font-semibold">Balance (USD)</label>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-white/40 text-lg font-bold">$</span>
            <input
              type="number"
              value={balance}
              onChange={(e) => onBalanceChange(Math.max(0, Number(e.target.value)))}
              className={`text-2xl font-bold bg-white/5 border ${themeBorder} rounded px-3 py-1 ${themeInputFocus} focus:outline-none w-full text-white transition-all`}
            />
          </div>
          <p className="text-[10px] text-white/30 mt-2 font-mono">Predefined capital pool</p>
        </motion.div>

        {/* Risk Percentage Card */}
        <motion.div
          layout
          layoutId="db-risk-pct"
          className={`${themeBg} border ${themeBorder} ${themeGlow} rounded-xl p-5 relative overflow-hidden group`}
        >
          <div className="absolute right-3 top-3 opacity-10 text-rose-400 group-hover:scale-110 transition-transform">
            <Percent className="h-10 w-10" />
          </div>
          <label className="text-[11px] text-white/50 block mb-1 uppercase tracking-wider font-semibold">Risk per Trade (%)</label>
          <div className="mt-2 flex items-center gap-1.5">
            <input
              type="number"
              step="0.1"
              value={riskPct}
              onChange={(e) => onRiskPctChange(Math.max(0.1, Math.min(100, Number(e.target.value))))}
              className={`text-2xl font-bold bg-white/5 border ${themeBorder} rounded px-3 py-1 ${themeInputFocus} focus:outline-none w-2/3 text-white transition-all`}
            />
            <span className="text-white/40 text-lg font-bold">%</span>
          </div>
          <p className="text-[10px] text-rose-450 mt-2 font-mono flex items-center gap-1">
            <Flame className="h-3 w-3 text-rose-500" />
            Max Deficit: {formatMoney(positionStats.riskAmount)}
          </p>
        </motion.div>

        {/* Dynamic Contract Lot Sizing Output */}
        <motion.div
          layout
          layoutId="db-lot-calc"
          className={`${themeBg} border ${isChampagne ? "border-amber-500/25" : isHyperneon ? "border-fuchsia-500/25" : "border-blue-500/25"} ${themeGlow} rounded-xl p-5 relative overflow-hidden group col-span-1 md:col-span-2 bg-gradient-to-br from-transparent to-white/[0.01]`}
        >
          <div className={`absolute top-0 right-0 w-24 h-24 ${isChampagne ? "bg-amber-500/5" : isHyperneon ? "bg-fuchsia-500/5" : "bg-blue-500/5"} rounded-full -mr-12 -mt-12`}></div>
          <label className={`text-[11px] ${themeText} font-bold uppercase tracking-wider block`}>Lot Calculation</label>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">
              {direction !== "NO_TRADE" ? positionStats.lots.toFixed(2) : "0.00"}
            </span>
            <span className="text-xs text-white/50">Standard Lots</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-4 text-[10px] font-mono border-t border-white/5 pt-2 text-white/40">
            <div>
              Distance: <span className="text-yellow-500 font-bold">{positionStats.pipDistance} pips</span>
            </div>
            <div>
              1 Lot = {spec.contractSize.toLocaleString()} units
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Grid of Interactive Trade Level Customizer & Performance Dashboard */}
      <motion.div layout layoutId="dashboard-main-split-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Level Controls & Stats Parameters */}
        <motion.div layout layoutId="db-level-controls" className="lg:col-span-12 xl:col-span-5 space-y-6">
          <div className={`${themeBg} border ${themeBorder} rounded-xl p-5 ${themeGlow} space-y-4`}>
            <h3 className="text-xs uppercase text-white/40 font-bold tracking-[0.2em] border-b border-white/5 pb-2">
              🛠️ Trade Levels & Parameters
            </h3>

            {/* Instrument Select */}
            <div>
              <label className="block text-[11px] text-white/50 mb-1 font-semibold uppercase tracking-wider">Trading Instrument</label>
              <select
                value={symbol}
                onChange={(e) => onSymbolChange(e.target.value)}
                className={`w-full text-xs bg-white/5 border ${themeBorder} rounded-lg py-2 px-3 focus:outline-none ${themeInputFocus} text-white font-bold transition-all`}
              >
                {Object.keys(SUPPORTED_SYMBOLS).map((s) => (
                  <option key={s} value={s} className="bg-slate-905 text-white bg-[#0F1117]">
                    {SUPPORTED_SYMBOLS[s].display}
                  </option>
                ))}
              </select>
            </div>

            {/* Timeframe Select */}
            <div>
              <label className="block text-[11px] text-white/50 mb-1 font-semibold uppercase tracking-wider">Timeframe</label>
              <select
                value={timeframe}
                onChange={(e) => onTimeframeChange(e.target.value)}
                className={`w-full text-xs bg-white/5 border ${themeBorder} rounded-lg py-2 px-3 focus:outline-none ${themeInputFocus} text-white font-mono transition-all`}
              >
                {TIMEFRAMES.map((tf) => (
                  <option key={tf} value={tf} className="bg-slate-905 text-white bg-[#0F1117]">
                    {tf}
                  </option>
                ))}
              </select>
            </div>

            {/* Regime Select */}
            <div>
              <label className="block text-[11px] text-white/50 mb-1 font-semibold uppercase tracking-wider">Market Regime</label>
              <select
                value={regime}
                onChange={(e) => onRegimeChange(e.target.value)}
                className={`w-full text-xs bg-white/5 border ${themeBorder} rounded-lg py-2 px-3 focus:outline-none ${themeInputFocus} text-white font-bold transition-all`}
              >
                <option value="TREND_BULLISH" className="bg-slate-905 text-white bg-[#0F1117]">TREND BULLISH</option>
                <option value="TREND_BEARISH" className="bg-slate-905 text-white bg-[#0F1117]">TREND BEARISH</option>
                <option value="RANGE" className="bg-slate-905 text-white bg-[#0F1117]">RANGE MARKET</option>
                <option value="BREAKOUT" className="bg-slate-905 text-white bg-[#0F1117]">Consolidation Breakout</option>
                <option value="VOLATILITY_SPIKE" className="bg-slate-905 text-white bg-[#0F1117]">Volatility Spike</option>
              </select>
            </div>

            {/* Strategy Select */}
            <div>
              <label className="block text-[11px] text-white/50 mb-1 font-semibold uppercase tracking-wider">Active Trading Strategy</label>
              <select
                value={strategyId}
                onChange={(e) => onStrategyChange(e.target.value)}
                className={`w-full text-xs bg-white/5 border ${themeBorder} rounded-lg py-2 px-3 focus:outline-none ${themeInputFocus} text-white font-bold transition-all`}
              >
                {STRATEGIES.map((st) => (
                  <option key={st.id} value={st.id} className="bg-slate-905 text-white bg-[#0F1117]">
                    Setup #{st.id}: {st.name.substring(0, 30)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Direction Bias Buttons */}
            <div>
              <label className="block text-[11px] text-white/50 mb-1 font-semibold uppercase tracking-wider">Position Direction Bias</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => onDirectionChange("BUY")}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    isBuy
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-[1.01]"
                      : "bg-white/5 border-white/10 text-white/60 hover:border-white/20 select-none cursor-pointer"
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => onDirectionChange("SELL")}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    isSell
                      ? "bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] scale-[1.01]"
                      : "bg-white/5 border-white/10 text-white/60 hover:border-white/20 select-none cursor-pointer"
                  }`}
                >
                  <TrendingDown className="h-3.5 w-3.5" />
                  SELL
                </button>
                <button
                  type="button"
                  onClick={() => onDirectionChange("NO_TRADE")}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    direction === "NO_TRADE"
                      ? "bg-white/10 border-white/30 text-white"
                      : "bg-white/5 border-white/10 text-white/40 hover:border-white/20 cursor-pointer"
                  }`}
                >
                  CANCEL
                </button>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 space-y-3 font-mono">
              {/* Level Input fields */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">ENTRY LEVEL</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={entry || 0}
                    onChange={(e) => onEntryChange(Number(e.target.value))}
                    className={`w-full text-xs font-bold bg-white/5 border ${themeBorder} rounded px-2.5 py-1.5 text-blue-400 focus:outline-none ${themeInputFocus} transition-all`}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">STOP LOSS</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={sl || 0}
                    onChange={(e) => onSlChange(Number(e.target.value))}
                    className={`w-full text-xs font-bold bg-white/5 border ${themeBorder} rounded px-2.5 py-1.5 text-rose-400 focus:outline-none ${themeInputFocus} transition-all`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">TAKE PROFIT 1</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={tp1 || 0}
                    onChange={(e) => onTp1Change(Number(e.target.value))}
                    className={`w-full text-xs font-bold bg-white/5 border ${themeBorder} rounded px-2.5 py-1.5 text-emerald-400 focus:outline-none ${themeInputFocus} transition-all`}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">TAKE PROFIT 2</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={tp2 || 0}
                    onChange={(e) => onTp2Change(Number(e.target.value))}
                    className={`w-full text-xs font-bold bg-white/5 border ${themeBorder} rounded px-2.5 py-1.5 text-teal-400 focus:outline-none ${themeInputFocus} transition-all`}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Interactive Math Dashboard Cards */}
        <motion.div layout className="lg:col-span-12 xl:col-span-7 flex flex-col justify-between space-y-6">
          <motion.div layout layoutId="dashboard-stats-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TP1 Stats Box */}
            <motion.div
              layout
              layoutId="db-tp1-stats"
              className={`${themeBg} border ${themeBorder} ${themeGlow} rounded-xl p-5 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[11px] text-white/50 font-bold uppercase tracking-wider">RR Ratio (TP1)</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                    1.5R Target
                  </span>
                </div>
                <div className="mt-4">
                  <span className="text-[11px] text-white/40">Potential Take Profit</span>
                  <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                    +{formatMoney(positionStats.potentialTp1Usd)}
                  </div>
                </div>
              </div>
              <div className="mt-6 border-t border-white/5 pt-3 flex items-center justify-between font-mono text-[11px] text-white/40">
                <span>R:R Multiple</span>
                <span className="text-white font-bold">{positionStats.ratioTp1}x</span>
              </div>
            </motion.div>

            {/* TP2 Stats Box */}
            <motion.div
              layout
              layoutId="db-tp2-stats"
              className={`${themeBg} border ${themeBorder} ${themeGlow} rounded-xl p-5 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[11px] text-white/50 font-bold uppercase tracking-wider">RR Ratio (TP2)</span>
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 font-bold px-2 py-0.5 rounded border border-blue-500/20">
                    Master Setup
                  </span>
                </div>
                <div className="mt-4">
                  <span className="text-[11px] text-white/40">Potential Take Profit</span>
                  <div className="text-2xl font-bold text-blue-400 font-mono mt-1">
                    +{formatMoney(positionStats.potentialTp2Usd)}
                  </div>
                </div>
              </div>
              <div className="mt-6 border-t border-white/5 pt-3 flex items-center justify-between font-mono text-[11px] text-white/40">
                <span>R:R Multiple</span>
                <span className="text-white font-bold">{positionStats.ratioTp2}x</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Strategy Details, Explanation and Checklist Component */}
          <motion.div
            layout
            layoutId="db-strategy-card"
            className={`${themeBg} border ${themeBorder} ${themeGlow} rounded-xl overflow-hidden flex-1 flex flex-col justify-between`}
          >
            <div className={`flex ${themeHeaderBg} px-5 py-3.5 border-b ${themeBorder} items-center justify-between`}>
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-[#E0E0E6] flex items-center gap-1.5">
                <Compass className={`h-4 w-4 ${themeText} animate-spin-slow`} />
                Playbook Checklists & Notes
              </h3>
              <span className={`text-[10.5px] ${themeAccentBg} ${themeText} font-bold px-2.5 py-0.5 rounded-full uppercase border ${themeAccentBorder}`}>
                {currentStrategy.tier} Tier
              </span>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
              {/* Dynamic Strategy Checklist */}
              <div className="flex flex-col">
                <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Strategy Conditions Match
                </h4>
                <div className="flex-1 space-y-2 border border-white/5 rounded-lg p-3 bg-black/25 max-h-[165px] overflow-y-auto custom-scrollbar">
                  {currentStrategy.checklist.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-white/60">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="mt-0.5 h-3.5 w-3.5 accent-blue-500 text-slate-955 rounded border-white/10 bg-black"
                      />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Text Analysis explanation */}
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex flex-col gap-1.5 mb-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Edit3 className={`h-3.5 w-3.5 ${themeText}`} />
                      AI Reasoning & Analysis Rationale
                    </h4>
                    {hasAnalyzed && (explanation.includes("fallback") || explanation.includes("Fallback")) && (
                      <div className="text-[10.5px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 animate-pulse">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>High-demand API load: Smart Algorithmic Fallback Engine active</span>
                      </div>
                    )}
                  </div>
                  {hasAnalyzed ? (
                    <textarea
                      value={explanation}
                      onChange={(e) => onExplanationChange(e.target.value)}
                      className={`w-full text-xs text-white/70 bg-white/5 border ${themeBorder} rounded-lg p-2.5 h-[115px] focus:outline-none ${themeInputFocus} custom-scrollbar resize-none transition-all`}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-orange-500/5 border border-orange-500/20 text-orange-400 text-xs">
                      <AlertTriangle className="h-5 w-5 shrink-0" />
                      <p>
                        Upload any chart screenshot above. The model will read the trends and populate the trade rationale here.
                      </p>
                    </div>
                  )}
                </div>

                {/* Result Status Picker before Save */}
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1.5 mb-3 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-black tracking-widest text-[#E0E0E6]/30">Initial Outcome status</span>
                    <span className="text-[10px] font-bold text-white/80">
                      {targetResult === 'pending' && "🕒 Pending Setup"}
                      {targetResult === 'success_tp1' && "🏆 TP1 Reached (Win)"}
                      {targetResult === 'success_tp2' && "🔥 TP2 Reached (Win)"}
                      {targetResult === 'failed_sl' && "💀 Stop Loss Hit (Loss)"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      type="button"
                      onClick={() => setTargetResult('pending')}
                      className={`py-1 text-[8.5px] font-black uppercase tracking-wider rounded border transition cursor-pointer ${
                        targetResult === 'pending'
                          ? isChampagne 
                            ? "bg-amber-500/15 border-amber-500 text-amber-400" 
                            : isHyperneon 
                              ? "bg-fuchsia-500/15 border-fuchsia-500 text-fuchsia-400" 
                              : "bg-blue-500/15 border-blue-500 text-blue-400"
                          : "bg-white/5 border-transparent text-white/40 hover:text-white/80 hover:bg-white/10"
                      }`}
                    >
                      Pend
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetResult('success_tp1')}
                      className={`py-1 text-[8.5px] font-black uppercase tracking-wider rounded border transition cursor-pointer ${
                        targetResult === 'success_tp1'
                          ? "bg-emerald-500/15 border-emerald-500 text-emerald-400"
                          : "bg-white/5 border-transparent text-white/40 hover:text-white/80 hover:bg-white/10"
                      }`}
                    >
                      TP1 Win
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetResult('success_tp2')}
                      className={`py-1 text-[8.5px] font-black uppercase tracking-wider rounded border transition cursor-pointer ${
                        targetResult === 'success_tp2'
                          ? "bg-emerald-600/20 border-emerald-500 text-emerald-400"
                          : "bg-white/5 border-transparent text-white/40 hover:text-white/80 hover:bg-white/10"
                      }`}
                    >
                      TP2 Win
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetResult('failed_sl')}
                      className={`py-1 text-[8.5px] font-black uppercase tracking-wider rounded border transition cursor-pointer ${
                        targetResult === 'failed_sl'
                          ? "bg-rose-500/15 border-rose-500 text-rose-400"
                          : "bg-white/5 border-transparent text-white/40 hover:text-white/80 hover:bg-white/10"
                      }`}
                    >
                      SL Loss
                    </button>
                  </div>
                </div>

                {/* Telegram Sub-toggle */}
                <div 
                  className="flex items-center justify-between bg-black/30 p-2.5 rounded-xl border border-white/5 mb-3 cursor-pointer select-none" 
                  onClick={handleToggleForwarding}
                >
                  <div className="flex items-center gap-2">
                    <Send className={`h-4 w-4 ${telegramForwarding ? 'text-blue-400' : 'text-white/40'}`} />
                    <span className="text-[10px] font-bold text-white/80">Auto Telegram Forward</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${telegramForwarding ? 'bg-blue-500' : 'bg-white/10'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${telegramForwarding ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>

                {/* Main Action Controllers conforming to Immersive UI */}
                <div className="flex gap-2 pt-3 md:pt-0">
                  <button
                    type="button"
                    onClick={() => setMqlOpen(!mqlOpen)}
                    className="flex-1 flex items-center justify-center gap-1 bg-white/5 hover:bg-white/10 text-white text-xs py-2 rounded-lg font-bold border border-white/10 transition-colors cursor-pointer"
                  >
                    <FileCode2 className="h-4 w-4" />
                    {mqlOpen ? "Hide Code" : "MQL5 EA Code"}
                  </button>

                  <button
                    type="button"
                    disabled={direction === "NO_TRADE" || isSaving}
                    onClick={handleSaveWithTelegram}
                    className={`flex-1 flex items-center justify-center gap-1 ${themeBtn} disabled:bg-white/5 disabled:scale-100 disabled:shadow-none disabled:text-white/20 text-xs py-2 rounded-lg font-bold transition-all cursor-pointer`}
                  >
                    <Plus className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Add to Journal"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* MQL5 Code Viewer Accordion with Framer Motion AnimatePresence */}
      <AnimatePresence>
        {mqlOpen && (
          <motion.div
            layout
            layoutId="db-mql-code"
            initial={{ opacity: 0, height: 0, y: 15 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: 15 }}
            transition={{ duration: 0.3 }}
            className={`${themeBg} border ${themeBorder} ${themeGlow} rounded-xl p-5 mt-4 overflow-hidden`}
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-4">
              <h4 className="text-xs text-white/60 font-bold flex items-center gap-2">
                <FileCode2 className={`h-4 w-4 ${themeText}`} />
                MetaTrader 5 (MQL5) EA Script Snip
              </h4>
              <button
                type="button"
                onClick={handleCopyCode}
                disabled={direction === "NO_TRADE"}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold py-1.5 px-3.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                {copiedCode ? "Copied!" : "Copy Snippet"}
              </button>
            </div>
            <pre className="text-[10.5px] text-white/50 font-mono overflow-x-auto bg-black/40 border border-white/5 p-4 rounded-lg select-all leading-normal max-h-[350px] custom-scrollbar">
              {generateMql5Code(
                symbol,
                direction,
                positionStats.lots,
                entry,
                sl,
                tp1,
                tp2,
                currentStrategy.name
              )}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
