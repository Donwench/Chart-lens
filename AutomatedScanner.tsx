import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Activity, Bell, Send, RefreshCw, BarChart2, ShieldAlert } from "lucide-react";
import { TelegramService } from "../services/TelegramService";

interface ScanResult {
  symbol: string;
  price: number;
  volume24h: number;
  rsi14: number;
  signal: string;
}

interface AutomatedScannerProps {
  themePreset: "sapphire" | "champagne" | "hyperneon";
}

export const AutomatedScanner: React.FC<AutomatedScannerProps> = ({ themePreset }) => {
  const [category, setCategory] = useState<"spot" | "linear">("linear");
  const [results, setResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  // Telegram alert state
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<string>(TelegramService.getSelectedChatId() || "");
  const [alertStatus, setAlertStatus] = useState<{ [symbol: string]: string }>({});

  const themeText = themePreset === "champagne" ? "text-amber-400" : themePreset === "hyperneon" ? "text-fuchsia-400" : "text-blue-400";
  const themeBg = themePreset === "champagne" 
    ? "bg-amber-950/20" 
    : themePreset === "hyperneon" 
      ? "bg-fuchsia-950/20" 
      : "bg-blue-950/20";
  const themeBorder = themePreset === "champagne" ? "border-amber-500/20" : themePreset === "hyperneon" ? "border-fuchsia-500/20" : "border-blue-500/20";
  const btnClass = themePreset === "champagne"
    ? "bg-amber-600 hover:bg-amber-500 text-black"
    : themePreset === "hyperneon"
    ? "bg-fuchsia-600 hover:bg-fuchsia-500 text-white"
    : "bg-blue-600 hover:bg-blue-500 text-white";

  const fetchChats = async () => {
    const fetchedChats = await TelegramService.getChats();
    setChats(fetchedChats);
  };

  const scanMarket = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bybit/scan?category=${category}`);
      const data = await res.json();
      if (data.scanResults) {
        setResults(data.scanResults);
        setLastScanned(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleChatSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedChat(val);
    TelegramService.setSelectedChatId(val);
  };

  const sendAlert = async (symbol: string, signal: string, rsi: number) => {
    if (!selectedChat) {
      setAlertStatus({ ...alertStatus, [symbol]: "Select a chat first!" });
      setTimeout(() => setAlertStatus({ ...alertStatus, [symbol]: "" }), 3000);
      return;
    }
    
    setAlertStatus({ ...alertStatus, [symbol]: "Sending..." });
    try {
      const msg = `⚠️ *Market Alert - BYBIT ${category.toUpperCase()}* ⚠️\n\n` +
                  `*Symbol:* ${symbol}\n` +
                  `*Signal:* ${signal}\n` +
                  `*Daily RSI(14):* ${rsi.toFixed(2)}\n\n` +
                  `_Long-term structural analysis setup detected._`;
      
      const response = await TelegramService.sendAlert(selectedChat, msg);
      if (response.success) {
        setAlertStatus({ ...alertStatus, [symbol]: "Sent!" });
      } else {
        setAlertStatus({ ...alertStatus, [symbol]: "Failed" });
      }
    } catch (e) {
      setAlertStatus({ ...alertStatus, [symbol]: "Error" });
    }
    setTimeout(() => {
      setAlertStatus((prev) => ({...prev, [symbol]: ""}));
    }, 3000);
  };

  return (
    <motion.div layout className="space-y-6">
      {/* Header Banner */}
      <div className={`${themeBg} border ${themeBorder} rounded-2xl p-6 relative overflow-hidden group transition-all duration-300`}>
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-white/[0.03] to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-black border ${themeBorder} flex items-center justify-center shadow-lg`}>
              <Activity className={`h-6 w-6 ${themeText}`} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-widest uppercase">
                Automated Bybit Scanner
              </h2>
              <p className="text-xs text-white/50 tracking-wider">
                Scans Daily Interval (1-2 Day Long Term Outlook)
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="bg-black/40 border border-white/10 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
            >
              <option value="linear">Derivatives (USDT Perp)</option>
              <option value="spot">Spot Market</option>
            </select>
            
            <button 
              onClick={scanMarket}
              disabled={loading}
              className={`${btnClass} font-bold text-xs px-5 py-2 rounded-lg cursor-pointer flex justify-center items-center gap-2`}
            >
              {loading ? (
                 <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                 <BarChart2 className="h-4 w-4" />
              )}
              {loading ? "SCANNING..." : "RUN SCANNER"}
            </button>
          </div>
        </div>
      </div>

      {/* Telegram Setup */}
      <div className="bg-[#0F1117] border border-white/5 rounded-xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-4 w-4 text-white/60" />
          <h3 className="text-sm font-bold text-white tracking-widest uppercase">Telegram Integration</h3>
        </div>
        <p className="text-xs text-white/40 mb-4 max-w-2xl">
          To receive alerts, open your Telegram bot and send a message. Then click "Refresh Chats" below and select your ID.
        </p>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchChats}
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-xs font-bold text-white cursor-pointer"
          >
            Refresh Chats
          </button>
          <select 
            value={selectedChat}
            onChange={handleChatSelect}
            className="flex-1 bg-black/40 border border-white/10 text-white text-xs px-3 py-2 rounded-lg cursor-pointer"
          >
            <option value="">-- Select Target Telegram Chat --</option>
            {chats.map(c => (
              <option key={c.id} value={c.id}>
                {c.first_name || ""} {c.last_name || ""} {c.username ? `(@${c.username})` : `[${c.id}]`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Grid */}
      {lastScanned && (
        <div className="bg-[#0F1117] border border-white/5 rounded-xl p-5">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
               <ShieldAlert className="h-4 w-4 text-green-400" />
               Scanner Results (Top 30 Volumes)
             </h3>
             <span className="text-[10px] text-white/40 font-mono">Last Scanned: {lastScanned}</span>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-black/40 text-white/40 border-b border-white/5">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Symbol</th>
                    <th className="px-4 py-3 font-semibold">Price</th>
                    <th className="px-4 py-3 font-semibold">24h Vol (USDT)</th>
                    <th className="px-4 py-3 font-semibold">Daily RSI</th>
                    <th className="px-4 py-3 font-semibold">Signal</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-white/40">
                         No data available.
                      </td>
                    </tr>
                  ) : (
                    results.map((r) => {
                      const isBuy = r.signal.includes("BUY") || r.signal.includes("BULLISH");
                      return (
                        <tr key={r.symbol} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 font-bold text-white">{r.symbol}</td>
                          <td className="px-4 py-3 font-mono text-white/80">{r.price}</td>
                          <td className="px-4 py-3 font-mono text-white/50">{(r.volume24h / 1000000).toFixed(2)}M</td>
                          <td className={`px-4 py-3 font-black font-mono ${r.rsi14 < 40 ? 'text-green-400' : r.rsi14 > 60 ? 'text-red-400' : 'text-white/60'}`}>
                            {r.rsi14.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] px-2 py-1 rounded inline-block font-black uppercase tracking-wider ${
                              isBuy ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                              r.signal.includes("TREND") ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                              "bg-white/5 text-white/50 border border-white/10"
                            }`}>
                              {r.signal}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                             <div className="flex justify-end items-center gap-2">
                                <span className={`text-[9px] ${
                                    alertStatus[r.symbol] === "Sent!" ? "text-green-400" :
                                    alertStatus[r.symbol]?.includes("Select") || alertStatus[r.symbol] === "Failed" ? "text-red-400" :
                                    "text-white/50"
                                }`}>{alertStatus[r.symbol]}</span>
                                <button
                                  onClick={() => sendAlert(r.symbol, r.signal, r.rsi14)}
                                  className="p-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 transition"
                                  title="Send to Telegram"
                                >
                                  <Send className="h-3 w-3" />
                                </button>
                             </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
           </div>
        </div>
      )}
    </motion.div>
  );
};

