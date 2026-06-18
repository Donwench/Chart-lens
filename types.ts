export interface Strategy {
  id: string;
  name: string;
  tier: 'intraday' | 'scalping' | 'swing';
  desc: string;
  defaultTp1Mult: number;
  defaultTp2Mult: number;
  checklist: string[];
}

export interface SymbolSpec {
  name: string;
  display: string;
  digits: number;
  contractSize: number;
  type: 'forex' | 'metal' | 'crypto';
}

export interface AnalysisResult {
  symbol: string;
  timeframe: string;
  currentPrice: number;
  regime: 'TREND_BULLISH' | 'TREND_BEARISH' | 'RANGE' | 'BREAKOUT' | 'VOLATILITY_SPIKE';
  recommendedStrategyId: string;
  recommendedStrategyName: string;
  direction: 'BUY' | 'SELL' | 'NO_TRADE';
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  explanation: string;
  confidence: number;
}

export interface SavedSetup {
  id: string;
  timestamp: string;
  symbol: string;
  timeframe: string;
  strategyId: string;
  strategyName: string;
  direction: 'BUY' | 'SELL' | 'NO_TRADE';
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  lots: number;
  riskPct: number;
  balance: number;
  explanation: string;
  image?: string; // base64 representation of original chart screenshot
  regime: string;
  confidence?: number;
  status?: 'pending' | 'success_tp1' | 'success_tp2' | 'failed_sl';
}
