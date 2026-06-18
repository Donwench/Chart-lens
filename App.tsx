import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Screener } from "./components/Screener";
import { Dashboard } from "./components/Dashboard";
import { Notebook } from "./components/Notebook";
import { MasterClass } from "./components/MasterClass";
import { Ticker } from "./components/Ticker";
import { MarketHeatmap } from "./components/MarketHeatmap";
import { AutomatedScanner } from "./components/AutomatedScanner";
import { STRATEGIES, SUPPORTED_SYMBOLS } from "./data";
import { calculatePositionStats } from "./utils";
import { SavedSetup } from "./types";
import {
  Sparkles,
  BookOpen,
  LineChart,
  HelpCircle,
  AlertCircle,
  TrendingDown,
  Info,
  Calendar,
  Flame,
  AlertTriangle,
  TrendingUp,
  X,
  ArrowRightLeft,
  GraduationCap,
  Activity,
} from "lucide-react";

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<"dashboard" | "notebook" | "masterclass" | "scanner">("dashboard");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [themePreset, setThemePreset] = useState<"sapphire" | "champagne" | "hyperneon">("sapphire");

  // Core Trading Parameters (Mutable by both AI extraction & manual override)
  const [image, setImage] = useState<string | null>(null);
  const [symbol, setSymbol] = useState("XAUUSD");
  const [timeframe, setTimeframe] = useState("M15");
  const [strategyId, setStrategyId] = useState("1");
  const [direction, setDirection] = useState<'BUY' | 'SELL' | 'NO_TRADE'>("BUY");
  const [regime, setRegime] = useState("RANGE");
  const [entry, setEntry] = useState<number>(2347.5);
  const [sl, setSl] = useState<number>(2337.2);
  const [tp1, setTp1] = useState<number>(2362.95);
  const [tp2, setTp2] = useState<number>(2386.1);
  const [explanation, setExplanation] = useState("");
  const [confidence, setConfidence] = useState<number>(0.85);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // User Preset Constants (Saved in localStorage)
  const [balance, setBalance] = useState<number>(10000);
  const [riskPct, setRiskPct] = useState<number>(1.0);

  // Journal Notebook Records
  const [savedSetups, setSavedSetups] = useState<SavedSetup[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedNotebookSetupId, setSelectedNotebookSetupId] = useState<string | null>(null);

  // Side-by-side comparison state
  const [compareMode, setCompareMode] = useState(false);
  const [compareId1, setCompareId1] = useState<string | null>(null);
  const [compareId2, setCompareId2] = useState<string | null>(null);

  const handleSelectCompareId = (id: string) => {
    if (compareId1 === id) {
      setCompareId1(null);
    } else if (compareId2 === id) {
      setCompareId2(null);
    } else if (!compareId1) {
      setCompareId1(id);
    } else if (!compareId2) {
      setCompareId2(id);
    } else {
      setCompareId2(id);
    }
  };

  // Volatility Notification Alerts state
  const [volatilityAlerts, setVolatilityAlerts] = useState<{
    id: string;
    symbol: string;
    direction: "UP" | "DOWN";
    percent: number;
    newValue: number;
    message: string;
    timestamp: string;
  }[]>([]);

  // Request browser Notification permissions gracefully on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(err => console.log("Notification permission err", err));
      }
    }
  }, []);

  const handleVolatilitySpike = (
    symbol: string,
    direction: "UP" | "DOWN",
    percent: number,
    newValue: number,
    message: string
  ) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const id = `spike-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    const newAlert = {
      id,
      symbol,
      direction,
      percent,
      newValue,
      message,
      timestamp,
    };

    setVolatilityAlerts((prev) => [newAlert, ...prev].slice(0, 4));

    // Distribute native browser notification if possible
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new window.Notification(`⚠️ VOLATILITY BREACH: ${symbol}`, {
          body: `${direction === "UP" ? "🔼 BULLISH SPIKE" : "🔽 BEARISH DROP"} of +${percent}% detected! Price is now ${newValue.toLocaleString()}`,
          tag: `volatility-${symbol}`,
        });
      } catch (err) {
        console.warn("Native Notification dispatch warning (iframe constraints apply):", err);
      }
    }

    // Auto-dismiss after 7.5 seconds
    setTimeout(() => {
      setVolatilityAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, 7500);
  };

  // Quick Loading states status lines to provide premium UX experience
  const [loadingStatusText, setLoadingStatusText] = useState("Processing upload...");

  // Load local presets & journal on startup
  useEffect(() => {
    // 1. Balance size preset
    const savedBalance = localStorage.getItem("trader_balance");
    if (savedBalance) setBalance(Number(savedBalance));

    // 2. Risk size percentage
    const savedRiskPct = localStorage.getItem("trader_risk_pct");
    if (savedRiskPct) setRiskPct(Number(savedRiskPct));

    // 3. Trade Notebook entries
    const savedJournal = localStorage.getItem("trading_journal");
    if (savedJournal) {
      try {
        setSavedSetups(JSON.parse(savedJournal));
      } catch (err) {
        console.error("Failed to load saved journal records", err);
      }
    }
  }, []);

  // Update presets in localStorage when changed
  useEffect(() => {
    localStorage.setItem("trader_balance", balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem("trader_risk_pct", riskPct.toString());
  }, [riskPct]);

  // Calculate position parameters automatically
  const positionStats = calculatePositionStats(
    symbol,
    entry,
    sl,
    tp1,
    tp2,
    balance,
    riskPct,
    direction
  );

  // Status rotation helper during extraction
  useEffect(() => {
    if (!isAnalyzing) return;
    const stages = [
      "Analyzing layout structures of chart...",
      "Reading symbol tags and current currency price bounds...",
      "Matching structural patterns against the 16 PLAYBOOK strategies...",
      "Evaluating price regime and proposed dynamic risk targets...",
      "Finalizing extraction parameters...",
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx = (currentIdx + 1) % stages.length;
      setLoadingStatusText(stages[currentIdx]);
    }, 2800);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Handle uploaded chart image base64
  const handleImageUploaded = async (base64Image: string) => {
    setImage(base64Image);
    setIsAnalyzing(true);
    setAnalysisError(null);
    setLoadingStatusText("Connecting to Gemini Vision API...");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Image,
          currentSymbol: symbol,
          currentTimeframe: timeframe,
          currentStrategyId: strategyId,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to analyze layout screenshot.");
      }

      const data = await response.json();

      // Set values extracted by model
      if (data.symbol) {
        const standardized = data.symbol.toUpperCase().replace("M", "");
        if (SUPPORTED_SYMBOLS[standardized]) {
          setSymbol(standardized);
        }
      }
      if (data.timeframe) setTimeframe(data.timeframe);
      if (data.regime) setRegime(data.regime);
      if (data.recommendedStrategyId) setStrategyId(data.recommendedStrategyId);
      if (data.direction) setDirection(data.direction);
      if (data.entry) setEntry(Number(data.entry));
      if (data.sl) setSl(Number(data.sl));
      if (data.tp1) setTp1(Number(data.tp1));
      if (data.tp2) setTp2(Number(data.tp2));
      if (data.explanation) setExplanation(data.explanation);
      if (data.confidence) setConfidence(Number(data.confidence));

      setHasAnalyzed(true);
      setActiveTab("dashboard");
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || "An unexpected issue occurred extracting levels.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Level adjustments on drag overlays
  const handleLevelsChanged = (levels: { entry?: number; sl?: number; tp1?: number; tp2?: number }) => {
    if (levels.entry !== undefined) setEntry(levels.entry);
    if (levels.sl !== undefined) setSl(levels.sl);
    if (levels.tp1 !== undefined) setTp1(levels.tp1);
    if (levels.tp2 !== undefined) setTp2(levels.tp2);
  };

  // Save Trade setup log into journal DB
  const handleSaveToJournal = (status: 'pending' | 'success_tp1' | 'success_tp2' | 'failed_sl' = 'pending') => {
    if (direction === "NO_TRADE") return;
    setIsSaving(true);

    const matchStrategy = STRATEGIES.find((st) => st.id === strategyId) || STRATEGIES[0];

    const newSetup: SavedSetup = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      symbol,
      timeframe,
      strategyId,
      strategyName: matchStrategy.name,
      direction,
      entry,
      sl,
      tp1,
      tp2,
      lots: positionStats.lots,
      riskPct,
      balance,
      explanation: explanation || "Dynamic analysis journal logging",
      image: image || undefined,
      regime,
      confidence,
      status,
    };

    const newJournal = [newSetup, ...savedSetups];
    setSavedSetups(newJournal);
    localStorage.setItem("trading_journal", JSON.stringify(newJournal));

    setTimeout(() => {
      setIsSaving(false);
      setActiveTab("notebook");
    }, 600);
  };

  // Delete setup log from journal
  const handleDeleteSetup = (id: string) => {
    const freshJournal = savedSetups.filter((s) => s.id !== id);
    setSavedSetups(freshJournal);
    localStorage.setItem("trading_journal", JSON.stringify(freshJournal));
    if (selectedNotebookSetupId === id) {
      setSelectedNotebookSetupId(null);
    }
  };

  // Update saved trade status inside journal
  const handleUpdateSetupStatus = (id: string, status: 'pending' | 'success_tp1' | 'success_tp2' | 'failed_sl') => {
    const freshJournal = savedSetups.map((s) => s.id === id ? { ...s, status } : s);
    setSavedSetups(freshJournal);
    localStorage.setItem("trading_journal", JSON.stringify(freshJournal));
  };

  // Restore saved notebook record to interactive board
  const handleSelectSavedSetup = (setup: SavedSetup) => {
    setSelectedNotebookSetupId(setup.id);
    setSymbol(setup.symbol);
    setTimeframe(setup.timeframe);
    setStrategyId(setup.strategyId);
    setDirection(setup.direction);
    setRegime(setup.regime);
    setEntry(setup.entry);
    setSl(setup.sl);
    setTp1(setup.tp1);
    setTp2(setup.tp2);
    setExplanation(setup.explanation);
    setBalance(setup.balance);
    setRiskPct(setup.riskPct);
    if (setup.image) {
      setImage(setup.image);
    }
    setHasAnalyzed(true);
    setActiveTab("dashboard");
  };

  const getCleanSymbolDisplay = () => {
    const spec = SUPPORTED_SYMBOLS[symbol] || { display: symbol };
    return spec.display;
  };

  const getCleanSymbolDigits = () => {
    const spec = SUPPORTED_SYMBOLS[symbol] || { digits: 5 };
    return spec.digits;
  };

  const isChampagne = themePreset === "champagne";
  const isHyperneon = themePreset === "hyperneon";

  const appThemeText = isChampagne ? "text-amber-400" : isHyperneon ? "text-fuchsia-400" : "text-blue-400";
  const appTabActive = isChampagne 
    ? "bg-amber-600 text-[#0D0B07] shadow-[0_0_15px_rgba(245,158,11,0.45)] font-black" 
    : isHyperneon 
      ? "bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(232,121,249,0.45)]" 
      : "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.45)]";

  return (
    <div className={`min-h-screen ${isChampagne ? "bg-[#090805]" : isHyperneon ? "bg-[#07040A]" : "bg-[#0A0B10]"} text-[#E0E0E6] flex flex-col selection:bg-blue-500/30 selection:text-blue-200 transition-colors duration-450`}>
      {/* Live News Ticker */}
      <Ticker symbol={symbol} themePreset={themePreset} />

      {/* Premium Header conforming to Immersive UI */}
      <header className={`sticky top-0 z-30 ${isChampagne ? "bg-[#0F0D09]" : isHyperneon ? "bg-[#100716]" : "bg-[#0F1117]"} border-b ${isChampagne ? "border-amber-500/10" : isHyperneon ? "border-fuchsia-500/10" : "border-white/10"} px-6 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between transition-all duration-300`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
            isChampagne 
              ? "bg-amber-600 text-[#0D0B07] shadow-[0_0_15px_rgba(245,158,11,0.5)]" 
              : isHyperneon 
                ? "bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(232,121,249,0.5)] animate-pulse" 
                : "bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          }`}>
            <LineChart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-widest text-white flex items-center gap-2">
              LENS <span className={`${appThemeText}`}>AESTHETICS</span>
              <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded border tracking-wider font-extrabold ${
                isChampagne 
                  ? "bg-amber-500/5 text-amber-400 border-amber-500/20" 
                  : isHyperneon 
                    ? "bg-fuchsia-500/5 text-fuchsia-400 border-fuchsia-500/20" 
                    : "bg-blue-500/5 text-blue-400 border-blue-500/20"
              }`}>
                V2.5 ULTRA-LUXE
              </span>
            </h1>
            <p className="text-[9px] text-white/40 tracking-widest mt-0.5 uppercase font-mono font-bold">
              Autonomous Trade Visionary & Execution Portal
            </p>
          </div>
        </div>

        {/* Dynamic Theme Presets Option Switcher */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
          <button
            onClick={() => setThemePreset("sapphire")}
            className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
              themePreset === "sapphire"
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/35 shadow-[0_0_10px_rgba(59,130,246,0.15)]"
                : "text-white/35 hover:text-white/70 border border-transparent"
            }`}
          >
            Sapphire Cyber
          </button>
          <button
            onClick={() => setThemePreset("champagne")}
            className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
              themePreset === "champagne"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/35 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                : "text-white/35 hover:text-white/70 border border-transparent"
            }`}
          >
            Champagne Gold
          </button>
          <button
            onClick={() => setThemePreset("hyperneon")}
            className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
              themePreset === "hyperneon"
                ? "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/35 shadow-[0_0_10px_rgba(232,121,249,0.15)] animate-pulse"
                : "text-white/35 hover:text-white/70 border border-transparent"
            }`}
          >
            Hyper Vibe
          </button>
        </div>

        {/* Tab Controllers conforming to Immersive UI */}
        <div className="flex bg-black/25 p-1 rounded-xl border border-white/5 gap-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? appTabActive
                : "text-white/50 hover:text-white"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Signal Dashboard
          </button>
          <button
            onClick={() => setActiveTab("notebook")}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all relative cursor-pointer ${
              activeTab === "notebook"
                ? appTabActive
                : "text-white/50 hover:text-white"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Setup Journal
            {savedSetups.length > 0 && (
              <span className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black ${
                isChampagne ? "bg-amber-500 text-black" : "bg-rose-500 text-white"
              }`}>
                {savedSetups.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("masterclass")}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all relative cursor-pointer ${
              activeTab === "masterclass"
                ? appTabActive
                : "text-white/50 hover:text-white"
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span className="relative">
              MasterClass
              <span className="absolute -top-1.5 -right-2.5 flex h-1.5 w-1.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isChampagne ? "bg-amber-400" : isHyperneon ? "bg-fuchsia-400" : "bg-blue-400"}`}></span>
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isChampagne ? "bg-amber-500" : isHyperneon ? "bg-fuchsia-500" : "bg-blue-500"}`}></span>
              </span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab("scanner")}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "scanner"
                ? appTabActive
                : "text-white/50 hover:text-white"
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            Auto Scanner
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Error Alert bar if analysis fails */}
        {analysisError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-start gap-3 text-xs mb-4 shadow">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-500" />
            <div>
              <span className="font-bold">Extraction Fault:</span>
              <p className="mt-1 text-slate-300">{analysisError}</p>
              <button
                onClick={() => setAnalysisError(null)}
                className="mt-2.5 px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-[10.5px] font-bold border border-white/10 transition-colors"
              >
                Acknowledge
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Interactive Window Split Layout */}
        {activeTab === "dashboard" ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Visual Screenshot Uploader left block */}
              <div className="lg:col-span-5 h-full">
                <Screener
                  image={image}
                  onImageUploaded={handleImageUploaded}
                  entry={entry}
                  sl={sl}
                  tp1={tp1}
                  tp2={tp2}
                  onLevelsChanged={handleLevelsChanged}
                  symbol={symbol}
                  digits={getCleanSymbolDigits()}
                  regime={regime}
                  direction={direction}
                  timeframe={timeframe}
                  explanation={explanation}
                  confidence={confidence}
                  onReset={() => {
                    setImage(null);
                    setHasAnalyzed(false);
                  }}
                  themePreset={themePreset}
                />
              </div>

              {/* Calculations and parameter adjustment right block */}
              <div className="lg:col-span-7 h-full">
                <Dashboard
                  symbol={symbol}
                  onSymbolChange={setSymbol}
                  timeframe={timeframe}
                  onTimeframeChange={setTimeframe}
                  strategyId={strategyId}
                  onStrategyChange={setStrategyId}
                  direction={direction}
                  onDirectionChange={setDirection}
                  regime={regime}
                  onRegimeChange={setRegime}
                  entry={entry}
                  onEntryChange={setEntry}
                  sl={sl}
                  onSlChange={setSl}
                  tp1={tp1}
                  onTp1Change={setTp1}
                  tp2={tp2}
                  onTp2Change={setTp2}
                  balance={balance}
                  onBalanceChange={setBalance}
                  riskPct={riskPct}
                  onRiskPctChange={setRiskPct}
                  positionStats={positionStats}
                  explanation={explanation}
                  onExplanationChange={setExplanation}
                  onSaveToJournal={handleSaveToJournal}
                  isSaving={isSaving}
                  hasAnalyzed={hasAnalyzed}
                  themePreset={themePreset}
                  savedSetups={savedSetups}
                />
              </div>
            </div>

            {/* Live Heatmap & Dynamic Alarms Dashboard Component */}
            <MarketHeatmap
              themePreset={themePreset}
              onSymbolSelect={(sym) => {
                setSymbol(sym);
                // Also trigger comfortable presets depending on the symbol
                if (sym.includes("BTC") || sym.includes("ETH")) {
                  setTimeframe("H1");
                } else if (sym === "XAUUSD") {
                  setTimeframe("M15");
                } else {
                  setTimeframe("M30");
                }
              }}
              activeSymbol={symbol}
              onVolatilitySpike={handleVolatilitySpike}
            />
          </motion.div>
        ) : activeTab === "notebook" ? (
          /* Ledger journal notebook panel */
          <motion.div
            key="notebook"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch"
          >
            <div className="md:col-span-4 h-full">
              <Notebook
                savedSetups={savedSetups}
                onSelectSetup={handleSelectSavedSetup}
                onDeleteSetup={handleDeleteSetup}
                onUpdateSetupStatus={handleUpdateSetupStatus}
                selectedSetupId={selectedNotebookSetupId}
                themePreset={themePreset}
                compareMode={compareMode}
                onToggleCompareMode={() => {
                  setCompareMode(!compareMode);
                  if (compareMode) {
                    setCompareId1(null);
                    setCompareId2(null);
                  }
                }}
                compareId1={compareId1}
                compareId2={compareId2}
                onSelectCompareId={handleSelectCompareId}
              />
            </div>

            {/* Journal quick help overview OR Comparison Side-by-Side Presentation */}
            <div className="md:col-span-8 flex flex-col h-full min-h-[520px]">
              {compareMode ? (
                <div className={`p-6 bg-[#0F1117] border ${isChampagne ? "border-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.05)]" : isHyperneon ? "border-fuchsia-500/10 shadow-[0_0_15px_rgba(232,121,249,0.05)]" : "border-white/5 shadow-[0_0_15px_rgba(59,130,246,0.05)]"} rounded-xl h-full flex flex-col min-h-[520px] transition-all duration-300`}>
                  
                  {/* Top Header of comparison block */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                    <div>
                      <h3 className="text-base font-black text-white flex items-center gap-2">
                        <ArrowRightLeft className={`h-4.5 w-4.5 ${appThemeText}`} />
                        SIDE-BY-SIDE SIGNAL COMPARISON
                      </h3>
                      <p className="text-[10px] uppercase font-mono tracking-wider text-white/40 mt-0.5">
                        Real-time parameters disparity audit and outcomes valuation
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setCompareId1(null);
                        setCompareId2(null);
                      }}
                      className="px-2.5 py-1 text-[9px] uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded border border-white/10 transition font-mono cursor-pointer"
                    >
                      CLEAR SELECTIONS
                    </button>
                  </div>

                  {/* Body Comparison details columns */}
                  {(() => {
                    const setupA = savedSetups.find((s) => s.id === compareId1);
                    const setupB = savedSetups.find((s) => s.id === compareId2);

                    const statsA = setupA ? calculatePositionStats(
                      setupA.symbol,
                      setupA.entry,
                      setupA.sl,
                      setupA.tp1,
                      setupA.tp2,
                      setupA.balance,
                      setupA.riskPct,
                      setupA.direction
                    ) : null;

                    const statsB = setupB ? calculatePositionStats(
                      setupB.symbol,
                      setupB.entry,
                      setupB.sl,
                      setupB.tp1,
                      setupB.tp2,
                      setupB.balance,
                      setupB.riskPct,
                      setupB.direction
                    ) : null;

                    if (!setupA && !setupB) {
                      return (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-white/30 my-auto">
                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-full mb-3 text-white/40">
                            <ArrowRightLeft className="h-6 w-6 animate-pulse" />
                          </div>
                          <h4 className="text-xs uppercase font-extrabold text-white/80 tracking-widest">No signals selected</h4>
                          <p className="text-[11px] text-white/50 mt-1 max-w-xs leading-relaxed">
                            Click on <span className="text-white font-bold">"+ SELECT"</span> on the signal cards on the left panel to populate Signal A & Signal B slots. Let the system run comparison metrics!
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Signal Column A */}
                        <div className={`p-4 rounded-xl border flex flex-col justify-between ${setupA ? "bg-[#090B10]/30 border-white/5" : "border-dashed border-white/5 bg-white/[0.01]"}`}>
                          {setupA ? (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
                                <span className="text-[9px] font-mono tracking-widest uppercase bg-emerald-500 text-black px-2 py-0.5 rounded-md font-black">
                                  SIGNAL A
                                </span>
                                <span className="text-[10px] text-white/30 font-mono">
                                  {new Date(setupA.timestamp).toLocaleDateString()}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="text-sm font-black text-white flex items-center gap-1.5 leading-none">
                                    {setupA.symbol}
                                    <span className="text-xs text-white/40 font-mono">({setupA.timeframe})</span>
                                  </h4>
                                  <p className="text-[10px] font-mono text-white/40 uppercase mt-1">
                                    {setupA.regime.replace(/_/g, " ")}
                                  </p>
                                </div>
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase border ${
                                  setupA.direction === "BUY"
                                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                    : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                                }`}>
                                  {setupA.direction}
                                </span>
                              </div>

                              {/* Price points table */}
                              <div className="p-3 bg-white/[0.015] border border-white/5 rounded-lg space-y-1.5 font-mono text-xs">
                                <div className="text-[9px] uppercase font-black tracking-widest text-[#E0E0E6]/30 mb-2">TARGET BOUNDARIES</div>
                                <div className="flex justify-between">
                                  <span className="text-white/40">Entry:</span>
                                  <span className="text-white font-extrabold text-right">{setupA.entry.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/40">Stop Loss:</span>
                                  <span className="text-rose-400 font-extrabold text-right">{setupA.sl.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/40">Take Profit 1:</span>
                                  <span className="text-emerald-400 font-extrabold text-right">{setupA.tp1.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/40">Take Profit 2:</span>
                                  <span className="text-[#3b82f6] font-extrabold text-right">{setupA.tp2.toLocaleString()}</span>
                                </div>
                              </div>

                              {/* Outcome Stats projections */}
                              {statsA && (
                                <div className="p-3 bg-white/[0.015] border border-white/5 rounded-lg space-y-1.5 font-mono text-xs">
                                  <div className="text-[9px] uppercase font-black tracking-widest text-[#E0E0E6]/30 mb-2">OUTCOME CALCULATIONS</div>
                                  <div className="flex justify-between">
                                    <span className="text-white/40">Pip SL Distance:</span>
                                    <span className="text-white font-bold">{statsA.pipDistance} pips</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-white/40">Volume Size:</span>
                                    <span className="text-white font-bold">{statsA.lots.toFixed(2)} lots</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-white/40">Target 1 profit:</span>
                                    <span className="text-emerald-400 font-extrabold">${statsA.potentialTp1Usd.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between items-center flex-wrap gap-1">
                                    <span className="text-white/40">Target 1 R:R:</span>
                                    <span className={`px-1.5 py-0.2 rounded font-black ${
                                      statsB && statsA.ratioTp1 > statsB.ratioTp1 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/70"
                                    }`}>
                                      1:{statsA.ratioTp1} {statsB && statsA.ratioTp1 > statsB.ratioTp1 && "🏆"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-white/40">Target 2 profit:</span>
                                    <span className="text-blue-400 font-extrabold">${statsA.potentialTp2Usd.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between items-center flex-wrap gap-1">
                                    <span className="text-white/40">Target 2 R:R:</span>
                                    <span className={`px-1.5 py-0.2 rounded font-black ${
                                      statsB && statsA.ratioTp2 > statsB.ratioTp2 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/70"
                                    }`}>
                                      1:{statsA.ratioTp2} {statsB && statsA.ratioTp2 > statsB.ratioTp2 && "🏆"}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Explanation details */}
                              <div className="text-[11px] leading-relaxed text-white/60 bg-white/[0.01] p-2.5 border border-white/5 rounded-lg">
                                <span className="font-bold text-white block mb-0.5 text-[10px] uppercase font-sans tracking-wide">Analysis Narrative:</span>
                                <p className="line-clamp-2">{setupA.explanation}</p>
                              </div>

                              {/* Restore Trigger button */}
                              <button
                                onClick={() => handleSelectSavedSetup(setupA)}
                                className={`w-full py-2 rounded-lg text-xs font-black tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer uppercase ${
                                  isChampagne 
                                    ? "bg-amber-600 hover:bg-amber-500 text-black" 
                                    : isHyperneon 
                                      ? "bg-fuchsia-600 hover:bg-fuchsia-500 text-white" 
                                      : "bg-blue-600 hover:bg-blue-500 text-white"
                                }`}
                              >
                                LOAD TO WORKSPACE
                              </button>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-white/20 my-auto">
                              <span className="text-2xl mb-2">📥</span>
                              <span className="text-[10px] uppercase font-black tracking-widest text-[#E0E0E6]/30">Signal A Slot Open</span>
                              <span className="text-[10px] mt-1">Select a card row on the left folder</span>
                            </div>
                          )}
                        </div>

                        {/* Signal Column B */}
                        <div className={`p-4 rounded-xl border flex flex-col justify-between ${setupB ? "bg-[#090B10]/30 border-white/5" : "border-dashed border-white/5 bg-white/[0.01]"}`}>
                          {setupB ? (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
                                <span className="text-[9px] font-mono tracking-widest uppercase bg-rose-500 text-white px-2 py-0.5 rounded-md font-black">
                                  SIGNAL B
                                </span>
                                <span className="text-[10px] text-white/30 font-mono">
                                  {new Date(setupB.timestamp).toLocaleDateString()}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="text-sm font-black text-white flex items-center gap-1.5 leading-none">
                                    {setupB.symbol}
                                    <span className="text-xs text-white/40 font-mono">({setupB.timeframe})</span>
                                  </h4>
                                  <p className="text-[10px] font-mono text-white/40 uppercase mt-1">
                                    {setupB.regime.replace(/_/g, " ")}
                                  </p>
                                </div>
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase border ${
                                  setupB.direction === "BUY"
                                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                    : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                                }`}>
                                  {setupB.direction}
                                </span>
                              </div>

                              {/* Price points table */}
                              <div className="p-3 bg-white/[0.015] border border-white/5 rounded-lg space-y-1.5 font-mono text-xs">
                                <div className="text-[9px] uppercase font-black tracking-widest text-[#E0E0E6]/30 mb-2">TARGET BOUNDARIES</div>
                                <div className="flex justify-between">
                                  <span className="text-white/40">Entry:</span>
                                  <span className="text-white font-extrabold text-right">{setupB.entry.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/40">Stop Loss:</span>
                                  <span className="text-rose-400 font-extrabold text-right">{setupB.sl.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/40">Take Profit 1:</span>
                                  <span className="text-emerald-400 font-extrabold text-right">{setupB.tp1.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/40">Take Profit 2:</span>
                                  <span className="text-[#3b82f6] font-extrabold text-right">{setupB.tp2.toLocaleString()}</span>
                                </div>
                              </div>

                              {/* Outcome Stats projections */}
                              {statsB && (
                                <div className="p-3 bg-white/[0.015] border border-white/5 rounded-lg space-y-1.5 font-mono text-xs">
                                  <div className="text-[9px] uppercase font-black tracking-widest text-[#E0E0E6]/30 mb-2">OUTCOME CALCULATIONS</div>
                                  <div className="flex justify-between">
                                    <span className="text-white/40">Pip SL Distance:</span>
                                    <span className="text-white font-bold">{statsB.pipDistance} pips</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-white/40">Volume Size:</span>
                                    <span className="text-white font-bold">{statsB.lots.toFixed(2)} lots</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-white/40">Target 1 profit:</span>
                                    <span className="text-emerald-400 font-extrabold">${statsB.potentialTp1Usd.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between items-center flex-wrap gap-1">
                                    <span className="text-white/40">Target 1 R:R:</span>
                                    <span className={`px-1.5 py-0.2 rounded font-black ${
                                      statsA && statsB.ratioTp1 > statsA.ratioTp1 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/70"
                                    }`}>
                                      1:{statsB.ratioTp1} {statsA && statsB.ratioTp1 > statsA.ratioTp1 && "🏆"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-white/40">Target 2 profit:</span>
                                    <span className="text-blue-400 font-extrabold">${statsB.potentialTp2Usd.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between items-center flex-wrap gap-1">
                                    <span className="text-white/40">Target 2 R:R:</span>
                                    <span className={`px-1.5 py-0.2 rounded font-black ${
                                      statsA && statsB.ratioTp2 > statsA.ratioTp2 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/70"
                                    }`}>
                                      1:{statsB.ratioTp2} {statsA && statsB.ratioTp2 > statsA.ratioTp2 && "🏆"}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Explanation details */}
                              <div className="text-[11px] leading-relaxed text-white/60 bg-white/[0.01] p-2.5 border border-white/5 rounded-lg">
                                <span className="font-bold text-white block mb-0.5 text-[10px] uppercase font-sans tracking-wide">Analysis Narrative:</span>
                                <p className="line-clamp-2">{setupB.explanation}</p>
                              </div>

                              {/* Restore Trigger button */}
                              <button
                                onClick={() => handleSelectSavedSetup(setupB)}
                                className={`w-full py-2 rounded-lg text-xs font-black tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer uppercase ${
                                  isChampagne 
                                    ? "bg-amber-600 hover:bg-amber-500 text-black" 
                                    : isHyperneon 
                                      ? "bg-fuchsia-600 hover:bg-fuchsia-500 text-white" 
                                      : "bg-blue-600 hover:bg-blue-500 text-white"
                                }`}
                              >
                                LOAD TO WORKSPACE
                              </button>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-white/20 my-auto">
                              <span className="text-2xl mb-2">📥</span>
                              <span className="text-[10px] uppercase font-black tracking-widest text-[#E0E0E6]/30">Signal B Slot Open</span>
                              <span className="text-[10px] mt-1">Select a card row on the left folder</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center text-center p-12 bg-[#0F1117] border border-white/5 rounded-xl min-h-[480px] h-full justify-self-center">
                  <div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4 text-blue-400">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-wide">Journal Archive Records</h3>
                  <p className="text-xs text-white/50 mt-2 max-w-sm leading-relaxed">
                    Review your historical signals, screenshots, and lot sizing parameters. When you select a card on the left side of your folder, we will dynamically reload all levels back into your master canvas workspace!
                  </p>
                  
                  {/* Highlight callout for Comparison mode */}
                  <div className="mt-5 p-3 rounded-lg bg-white/[0.02] border border-white/5 max-w-sm text-left flex gap-2">
                    <span className="mt-0.5 text-blue-400 font-extrabold text-[12px]">💡</span>
                    <p className="text-[10.5px] text-white/60">
                      <span className="text-white font-bold">Pro Tip:</span> Activate <span className="font-bold text-blue-400">SIDE-BY-SIDE Comparison Mode</span> at the top of your journal panel to compare two signals and determine the superior Risk-to-Reward ratio setup instantly!
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className="mt-6 font-bold text-xs bg-white/5 hover:bg-white/10 text-white py-2 px-5 rounded-lg border border-white/10 transition"
                  >
                    Go Back to Signal Workspace
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ) : activeTab === "masterclass" ? (
          <motion.div
            key="masterclass"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MasterClass themePreset={themePreset} />
          </motion.div>
        ) : (
          <motion.div
            key="scanner"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AutomatedScanner themePreset={themePreset} />
          </motion.div>
        )}

        {/* Footer info line details conforming to Immersive UI */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/30 gap-4">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              AI Vision Engine Active
            </span>
            <span>OCR Precision: 98.4%</span>
          </div>
          <div className="font-mono flex items-center gap-2">
            Session: Active • Latency: 12ms • v2.0.0-PLAYBOOK
          </div>
        </div>
      </main>

      {/* Full-Screen Premium Miner Loader Overlay conforming to Immersive UI */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-[#0A0B10]/90 backdrop-blur-md z-50 flex flex-col items-center justify-center">
          <div className="bg-[#0F1117] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center shadow-[0_0_30px_rgba(59,130,246,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 animate-pulse" />

            <div className="mt-2 flex justify-center">
              <div className="relative flex items-center justify-center">
                <div className="h-14 w-14 rounded-full border-t-2 border-r-2 border-blue-500 animate-spin" />
                <Sparkles className="h-6 w-6 text-blue-400 absolute animate-pulse" />
              </div>
            </div>

            <h3 className="text-sm font-bold tracking-widest text-white mt-6 uppercase">
              AI EXTRACTOR RUNNING...
            </h3>
            <p className="text-xs text-white/70 mt-3 font-semibold min-h-[40px] px-2 transition-all leading-relaxed">
              {loadingStatusText}
            </p>

            <span className="text-[10px] text-white/30 font-mono block mt-4 bg-[#0A0B10] py-1.5 rounded border border-white/5">
              Gemini 3.5 Flash Mining Suite Active
            </span>
          </div>
        </div>
      )}

      {/* Floating Volatility Notifications Alert Center */}
      <div className="fixed top-20 right-6 z-50 pointer-events-none w-full max-w-sm flex flex-col gap-3">
        <AnimatePresence>
          {volatilityAlerts.map((alert) => {
            const isUp = alert.direction === "UP";
            const accentColorClass = themePreset === "champagne"
              ? "border-amber-500/20 text-amber-400 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
              : themePreset === "hyperneon"
                ? "border-fuchsia-500/20 text-fuchsia-400 bg-fuchsia-950/20 shadow-[0_0_15px_rgba(232,121,249,0.15)]"
                : "border-blue-500/20 text-blue-400 bg-blue-950/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]";

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.2 } }}
                className={`pointer-events-auto rounded-xl border p-4 backdrop-blur-md flex gap-3 relative overflow-hidden bg-[#0A0B10]/95 ${accentColorClass}`}
              >
                {/* Visual Accent Pulse Bar on slide edge */}
                <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                  isUp ? "bg-emerald-500" : "bg-rose-500"
                }`} />

                {/* Left side icon block */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`p-1.5 rounded-lg ${
                    isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                  }`}>
                    {isUp ? <TrendingUp className="h-4.5 w-4.5" /> : <TrendingDown className="h-4.5 w-4.5" />}
                  </div>
                </div>

                {/* Content body block */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-widest text-white/50">
                      Active Workspace Pair Alarms
                    </span>
                    <span className="text-[9px] font-mono text-white/30 font-semibold">
                      {alert.timestamp}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white tracking-wide mt-1">
                    {alert.symbol} Volatility Alert
                  </h4>
                  <p className="text-xs text-white/70 leading-relaxed mt-1 font-medium">
                    Significant market expansion of{" "}
                    <span className={`font-black ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                      {isUp ? "▲ +" : "▼ -"}{alert.percent}%
                    </span>{" "}
                    detected! New price registered at{" "}
                    <span className="font-mono text-white font-extrabold">{alert.newValue.toLocaleString()}</span>.
                  </p>
                  
                  {/* Subtle logs tagline */}
                  <div className="mt-2 text-[10px] text-white/40 flex items-center gap-1 font-mono">
                    <Flame className="h-3 w-3 text-orange-400 animate-pulse" />
                    <span>Deviating beyond standard deviation delta</span>
                  </div>
                </div>

                {/* Close Button element */}
                <button
                  onClick={() => setVolatilityAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
                  className="absolute top-2.5 right-2.5 p-1 rounded-md text-white/30 hover:text-white/80 hover:bg-white/5 transition-all outline-none"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
