import React from "react";
import { SavedSetup } from "../types";
import { STRATEGIES, SUPPORTED_SYMBOLS } from "../data";
import { formatMoney } from "../utils";
import { Trash2, TrendingUp, TrendingDown, Clock, Search, BookOpen, ArrowRightLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NotebookProps {
  savedSetups: SavedSetup[];
  onSelectSetup: (setup: SavedSetup) => void;
  onDeleteSetup: (id: string) => void;
  onUpdateSetupStatus?: (id: string, status: 'pending' | 'success_tp1' | 'success_tp2' | 'failed_sl') => void;
  selectedSetupId: string | null;
  themePreset?: "sapphire" | "champagne" | "hyperneon";
  // Comparison Mode controls
  compareMode: boolean;
  onToggleCompareMode: () => void;
  compareId1: string | null;
  compareId2: string | null;
  onSelectCompareId: (id: string) => void;
}

export const Notebook: React.FC<NotebookProps> = ({
  savedSetups,
  onSelectSetup,
  onDeleteSetup,
  onUpdateSetupStatus,
  selectedSetupId,
  themePreset = "sapphire",
  compareMode,
  onToggleCompareMode,
  compareId1,
  compareId2,
  onSelectCompareId,
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"newest" | "oldest" | "confidence-desc" | "confidence-asc">("confidence-desc");
  const [filterConfidence, setFilterConfidence] = React.useState<"all" | "high" | "medium" | "low">("all");

  const processedSetups = React.useMemo(() => {
    // 1. Filter setups by search term
    let items = savedSetups.filter((s) => {
      const strategy = STRATEGIES.find((st) => st.id === s.strategyId);
      const searchString = `${s.symbol} ${s.timeframe} ${s.strategyName} ${strategy?.tier || ""}`.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });

    // 2. Filter by confidence tier
    if (filterConfidence !== "all") {
      items = items.filter((s) => {
        const conf = s.confidence !== undefined ? s.confidence : 0.85;
        if (filterConfidence === "high") return conf >= 0.80;
        if (filterConfidence === "medium") return conf >= 0.60 && conf < 0.80;
        if (filterConfidence === "low") return conf < 0.60;
        return true;
      });
    }

    // 3. Sort setups
    items = [...items].sort((a, b) => {
      const confA = a.confidence !== undefined ? a.confidence : 0.85;
      const confB = b.confidence !== undefined ? b.confidence : 0.85;

      switch (sortBy) {
        case "confidence-desc":
          return confB - confA;
        case "confidence-asc":
          return confA - confB;
        case "oldest":
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case "newest":
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

    return items;
  }, [savedSetups, searchTerm, sortBy, filterConfidence]);

  const isChampagne = themePreset === "champagne";
  const isHyperneon = themePreset === "hyperneon";

  const themeText = isChampagne ? "text-amber-400" : isHyperneon ? "text-fuchsia-400" : "text-blue-400";
  const themeGlow = isChampagne ? "shadow-[0_0_20px_rgba(245,158,11,0.2)]" : isHyperneon ? "shadow-[0_0_20px_rgba(232,121,249,0.25)]" : "shadow-[0_0_20px_rgba(59,130,246,0.18)]";
  const themeBorder = isChampagne ? "border-amber-500/10" : isHyperneon ? "border-fuchsia-500/10" : "border-white/5";
  const themeBg = isChampagne ? "bg-[#14110C]" : isHyperneon ? "bg-[#110A18]" : "bg-[#0F1117]";
  const themeHeaderBg = isChampagne ? "bg-[#0D0B07]/80" : isHyperneon ? "bg-[#09050C]/80" : "bg-[#0A0B10]/80";
  const themeInputFocus = isChampagne ? "focus:border-amber-500/60" : isHyperneon ? "focus:border-fuchsia-500/60" : "focus:border-blue-500/60";
  const themeCardActive = isChampagne 
    ? "bg-white/[0.08] border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.22)]" 
    : isHyperneon 
      ? "bg-white/[0.08] border-fuchsia-500/80 shadow-[0_0_20px_rgba(232,121,249,0.25)]" 
      : "bg-white/[0.08] border-blue-500/80 shadow-[0_0_20px_rgba(59,130,246,0.22)]";
  
  const themeSizingText = isChampagne ? "text-amber-400" : isHyperneon ? "text-fuchsia-400" : "text-blue-400";

  return (
    <div className={`${themeBg} border ${themeBorder} ${themeGlow} rounded-xl overflow-hidden flex flex-col h-full min-h-[520px] transition-all duration-300`}>
      <div className={`p-5 border-b ${themeBorder} ${themeHeaderBg}`}>
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <BookOpen className={`h-5 w-5 ${themeText}`} />
          Saved Trading Signal Journal
        </h2>
        <p className="text-[11px] text-white/50 mt-0.5">
          Review previous extractions, levels configurations, and calculations history
        </p>

        {/* Side-by-Side Comparison Controls */}
        <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-white/5">
          <button
            onClick={onToggleCompareMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black tracking-widest transition-all cursor-pointer ${
              compareMode
                ? isChampagne
                  ? "bg-amber-500/15 border-amber-500 text-amber-400 font-extrabold shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                  : isHyperneon
                    ? "bg-fuchsia-500/15 border-fuchsia-500 text-fuchsia-400 font-extrabold shadow-[0_0_10px_rgba(232,121,249,0.15)]"
                    : "bg-blue-500/15 border-blue-500 text-blue-400 font-extrabold shadow-[0_0_10px_rgba(59,130,246,0.15)]"
                : "bg-white/5 border-white/10 text-white/60 hover:text-white"
            }`}
          >
            <ArrowRightLeft className="h-3 w-3 animate-pulse" />
            {compareMode ? "DISABLE COMPARISON" : "COMPARE SIDE-BY-SIDE"}
          </button>
          
          <span className="text-[9.5px] text-white/30 font-mono">
            {compareMode ? "Select exact 2 signals" : "Click row to load levels"}
          </span>
        </div>

        {/* Search Bar & Filter Dropdowns Grid conforming to Immersive UI */}
        <div className="space-y-2.5 mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search by Symbol, Timeframe or Strategy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full text-xs pl-9 pr-4 py-2 bg-white/5 border ${themeBorder} rounded-lg text-white placeholder-white/30 focus:outline-none ${themeInputFocus} transition-all`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold block mb-1">AI Confidence</label>
              <select
                value={filterConfidence}
                onChange={(e) => setFilterConfidence(e.target.value as any)}
                className={`w-full text-[11px] px-2 py-1.5 bg-black/40 border ${themeBorder} rounded-lg text-white focus:outline-none ${themeInputFocus} transition-all cursor-pointer`}
              >
                <option value="all" className="bg-[#111] text-white">All Levels</option>
                <option value="high" className="bg-[#111] text-white">High (≥ 80%)</option>
                <option value="medium" className="bg-[#111] text-white">Mid (60% - 79%)</option>
                <option value="low" className="bg-[#111] text-white">Low (&lt; 60%)</option>
              </select>
            </div>

            <div>
              <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold block mb-1">Sort Entries</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`w-full text-[11px] px-2 py-1.5 bg-black/40 border ${themeBorder} rounded-lg text-white focus:outline-none ${themeInputFocus} transition-all cursor-pointer`}
              >
                <option value="confidence-desc" className="bg-[#111] text-white">Confidence: High to Low</option>
                <option value="confidence-asc" className="bg-[#111] text-white">Confidence: Low to High</option>
                <option value="newest" className="bg-[#111] text-white">Newest Recorded</option>
                <option value="oldest" className="bg-[#111] text-white">Oldest Recorded</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[500px] min-h-[300px] custom-scrollbar">
        {processedSetups.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-center h-full text-white/30">
            <span className="text-4xl">🗒️</span>
            <h3 className="text-sm font-bold text-white mt-3">No Journal Entries Found</h3>
            <p className="text-xs text-white/50 mt-1 max-w-xs">
              {searchTerm ? "No trading setups match your current search terms." : "Journal trade signals to save configurations and track historical extraction results!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3 relative">
            <AnimatePresence mode="popLayout" initial={false}>
              {processedSetups.map((setup) => {
                const spec = SUPPORTED_SYMBOLS[setup.symbol] || { digits: 5 };
                const isBuy = setup.direction === "BUY";
                const isItemInCompare1 = setup.id === compareId1;
                const isItemInCompare2 = setup.id === compareId2;
                const isSelectedForComparison = isItemInCompare1 || isItemInCompare2;

                const setupConfidence = setup.confidence !== undefined ? setup.confidence : 0.85;

                return (
                  <motion.div
                    key={setup.id}
                    layoutId={`notebook-card-${setup.id}`}
                    initial={{ opacity: 0, y: 15, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -25, scale: 0.95, transition: { duration: 0.25 } }}
                    whileHover={{ 
                      y: -4, 
                      scale: 1.012, 
                      boxShadow: isChampagne 
                        ? "0 8px 24px -6px rgba(245, 158, 11, 0.25)" 
                        : isHyperneon 
                          ? "0 8px 24px -6px rgba(232, 121, 249, 0.3)" 
                          : "0 8px 24px -6px rgba(59, 130, 246, 0.22)" 
                    }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 24, 
                      layout: { duration: 0.3, type: "spring", stiffness: 350, damping: 28 } 
                    }}
                    onClick={() => {
                      if (compareMode) {
                        onSelectCompareId(setup.id);
                      } else {
                        onSelectSetup(setup);
                      }
                    }}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer relative group ${
                      compareMode
                        ? isSelectedForComparison
                          ? isChampagne 
                            ? "bg-amber-500/15 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.22)] font-bold ring-1 ring-amber-500/40" 
                            : isHyperneon 
                              ? "bg-fuchsia-500/15 border-fuchsia-500 shadow-[0_0_15px_rgba(232,121,249,0.25)] font-bold ring-1 ring-fuchsia-500/40" 
                              : "bg-blue-500/15 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.22)] font-bold ring-1 ring-blue-500/40"
                          : `bg-white/[0.015] ${themeBorder} hover:bg-white/5`
                        : selectedSetupId === setup.id
                          ? themeCardActive
                          : `bg-white/[0.02] ${themeBorder} hover:bg-white/5 hover:${isChampagne ? "border-amber-500/25" : isHyperneon ? "border-fuchsia-500/25" : "border-blue-500/25"}`
                    }`}
                  >
                    {/* Delete or Compare Slots Badges */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      {compareMode ? (
                        <>
                          {isItemInCompare1 && (
                            <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded font-black tracking-widest uppercase bg-emerald-500 text-black`}>
                              SIGNAL A
                            </span>
                          )}
                          {isItemInCompare2 && (
                            <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded font-black tracking-widest uppercase bg-rose-500 text-white`}>
                              SIGNAL B
                            </span>
                          )}
                          {!isSelectedForComparison && (
                            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded font-bold uppercase bg-white/5 border border-white/5 text-white/30 group-hover:text-white/70 group-hover:bg-white/10 transition-colors">
                              + SELECT
                            </span>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSetup(setup.id);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-rose-455 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          title="Delete Setup"
                          id={`delete-btn-${setup.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                            isBuy
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                              : setup.direction === "SELL"
                              ? "bg-rose-500/15 text-rose-400 border border-rose-500/25"
                              : "bg-white/5 text-white/45 border border-white/10"
                          }`}
                        >
                          {isBuy ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {setup.direction}
                        </span>
                        <span className="text-sm font-bold text-white">{setup.symbol}</span>
                        <span className="text-xs text-white/40 font-mono">({setup.timeframe})</span>
                        <span className={`inline-flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                          setupConfidence >= 0.80 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : setupConfidence >= 0.60 
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          🤖 {(setupConfidence * 100).toFixed(0)}%
                        </span>
                      </div>

                      <div className="text-xs text-white/80 font-bold line-clamp-1 pr-14">
                        {setup.strategyName}
                      </div>

                      <div className="grid grid-cols-2 gap-y-1 text-[11px] font-mono border-t border-white/5 pt-2 text-white/50">
                        <div>
                          Entry: <span className="text-white/85">{setup.entry.toFixed(spec.digits)}</span>
                        </div>
                        <div>
                          Risk: <span className="text-rose-400 font-bold">{setup.riskPct}%</span>
                        </div>
                        <div>
                          Sizing: <span className={`${themeSizingText} font-bold`}>{setup.lots.toFixed(2)} lots</span>
                        </div>
                        <div>
                          Balance: <span className="text-white/85">${setup.balance.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-white/30 font-mono">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(setup.timestamp).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Interactive Status Selector */}
                      <div className="pt-2.5 border-t border-white/5 flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-white/40 font-bold">
                          <span>Trade Outcome</span>
                          <span className={`font-mono text-right font-extrabold ${
                            setup.status === 'success_tp1' || setup.status === 'success_tp2' 
                              ? "text-emerald-400" 
                              : setup.status === 'failed_sl' 
                                ? "text-rose-400" 
                                : "text-white/40"
                          }`}>
                            {setup.status === 'success_tp1' && "🏆 TP1 HIT (+Profit)"}
                            {setup.status === 'success_tp2' && "🔥 TP2 HIT (+Profit)"}
                            {setup.status === 'failed_sl' && "💀 SL HIT (-Risk)"}
                            {(!setup.status || setup.status === 'pending') && "🕒 PENDING"}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          <button
                            type="button"
                            title="Set to Pending"
                            onClick={() => onUpdateSetupStatus?.(setup.id, 'pending')}
                            className={`py-1 text-[8.5px] font-black uppercase tracking-widest rounded transition-all cursor-pointer ${
                              (!setup.status || setup.status === 'pending')
                                ? isChampagne
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : isHyperneon
                                    ? "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30"
                                    : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "bg-white/5 text-white/40 hover:text-white/80 hover:bg-white/10 border border-transparent"
                            }`}
                          >
                            PEND
                          </button>
                          <button
                            type="button"
                            title="Take Profit 1 Hit"
                            onClick={() => onUpdateSetupStatus?.(setup.id, 'success_tp1')}
                            className={`py-1 text-[8.5px] font-black uppercase tracking-widest rounded transition-all cursor-pointer ${
                              setup.status === 'success_tp1'
                                ? "bg-emerald-500/25 text-emerald-400 border border-emerald-500/40"
                                : "bg-emerald-950/20 text-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-950/40 border border-transparent"
                            }`}
                          >
                            TP1
                          </button>
                          <button
                            type="button"
                            title="Take Profit 2 Hit"
                            onClick={() => onUpdateSetupStatus?.(setup.id, 'success_tp2')}
                            className={`py-1 text-[8.5px] font-black uppercase tracking-widest rounded transition-all cursor-pointer ${
                              setup.status === 'success_tp2'
                                ? "bg-emerald-600/30 text-emerald-400 border border-emerald-500/50"
                                : "bg-emerald-950/20 text-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-950/40 border border-transparent"
                            }`}
                          >
                            TP2
                          </button>
                          <button
                            type="button"
                            title="Stop Loss Hit"
                            onClick={() => onUpdateSetupStatus?.(setup.id, 'failed_sl')}
                            className={`py-1 text-[8.5px] font-black uppercase tracking-widest rounded transition-all cursor-pointer ${
                              setup.status === 'failed_sl'
                                ? "bg-rose-500/25 text-rose-400 border border-rose-500/40"
                                : "bg-rose-950/20 text-rose-500/50 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent"
                            }`}
                          >
                            SL
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className={`p-4 ${isChampagne ? "bg-[#090805]" : isHyperneon ? "bg-[#07040A]" : "bg-[#0A0B10]"} border-t ${themeBorder} flex items-center justify-between text-[11px] text-white/30 font-mono`}>
        <span>Total Records: {savedSetups.length}</span>
        <span>Comparison: {compareMode ? "Enabled" : "Off"}</span>
      </div>
    </div>
  );
};
