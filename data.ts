import { Strategy, SymbolSpec } from "./types";

export const STRATEGIES: Strategy[] = [
  {
    id: "1",
    name: "ICT / SMC AMD (Accumulation, Manipulation, Distribution)",
    tier: "intraday",
    desc: "Sweep of Asian Range High/Low during London/NY session, followed by Market Structure Shift (MSS) and Fair Value Gap (FVG) entries.",
    defaultTp1Mult: 1.5,
    defaultTp2Mult: 3.0,
    checklist: [
      "Range context (ADX_14 < 30) indicating consolidation",
      "Active London or New York trading session window",
      "Asian Session Range (00:00-07:00 UTC) marked with clear high/low bound",
      "Liquidity Sweep: price briefly wicks above Asian high or below Asian low",
      "Market Structure Shift (MSS) on lower timeframe (M5/M1)",
      "Displacement Candle creating a Fair Value Gap (FVG) or Order Block (OB)",
      "Entry placed precisely inside the FVG / OB zone",
      "Stop Loss securely set above/below the manipulation sweep wick"
    ]
  },
  {
    id: "2",
    name: "Turtle Soup",
    tier: "intraday",
    desc: "Ranging liquidity sweep of previous keys levels (PDH/PDL, weekly extremes) with immediate rejection and reversal close.",
    defaultTp1Mult: 1.5,
    defaultTp2Mult: 3.0,
    checklist: [
      "Range-bound market environment (ADX_14 < 20)",
      "Active London or NY session Killzone",
      "High-timeframe structural level (Daily/Weekly High/Low, or PDH/PDL) marked",
      "Liquidity Sweep: price penetrates key level with dynamic candle wick",
      "Price quickly rejects, candle closes back inside the original range",
      "Bearish/Bullish engulfing or rejection close on lower timeframe",
      "Entry placed at the limit retest or rejection candle closure",
      "Stop Loss set just outside the sweep extremity (+1 pip offset)"
    ]
  },
  {
    id: "3",
    name: "Classic Trend Follow",
    tier: "intraday",
    desc: "Robust trend positioning. Wait for a healthy retracement to the EMA stack (20/50/200) during strong ADX trends.",
    defaultTp1Mult: 1.5,
    defaultTp2Mult: 2.5, // Trailing EMA preferred for TP2
    checklist: [
      "Trending market structure (ADX_14 > 25)",
      "Clear EMA sequence stack (EMA 20 > EMA 50 > EMA 200 for Bull, reverse for Bear)",
      "EMA 20 gradient is sloping significantly (not flat)",
      "Pullback: price retraces to test the dynamic EMA 20 or EMA 50 lines",
      "Candlestick Trigger: Bullish/Bearish engulfing or pin bar at EMA level",
      "No imminent major high-volatility news events",
      "Stop Loss placed at dynamic swing extremity or 1.5x ATR distance"
    ]
  },
  {
    id: "4",
    name: "Mean Reversion",
    tier: "intraday",
    desc: "Trading extreme bounds of Bollinger Bands when ADX shows low trending momentum, backed by RSI extreme levels.",
    defaultTp1Mult: 1.0, // BB Middle Target
    defaultTp2Mult: 2.0, // Opposite Band Target
    checklist: [
      "Quiet range environment (ADX_14 < 20)",
      "EMA lines are mostly flat and overlapping",
      "Bollinger Bands (20, 2) width is stable or contracting (not expanding)",
      "Price pierces outside the Upper Bollinger Band (Short) or Lower BB (Long)",
      "RSI 14 shows extreme exhaustion (>70 for short, <30 for long)",
      "Trigger: reversal candle closes back inside the Bollinger Bands space",
      "Take Profit 1 set exactly at the 20 EMA middle line"
    ]
  },
  {
    id: "5",
    name: "Breakout Consolidation",
    tier: "intraday",
    desc: "Entering explosive range breakouts indicated by sudden Bollinger Band width expansion and high trade volume.",
    defaultTp1Mult: 1.5, // Measured move target
    defaultTp2Mult: 3.0,
    checklist: [
      "Price has been consolidating in an extremely tight, narrow horizontal range",
      "Bollinger Bands Squeeze: BB width is at multi-candle contraction lows",
      "Breakout: price candle vigorously closes outside the range high or low",
      "Volatility expansion: Bollinger Band width expands suddenly (>1.5x)",
      "Volume spikes above 1.5x of the 20-candle average",
      "Entry: buy/sell stop placed 1 unit above/below breakout candle",
      "Potential measured move calculated as the height of the consolidation range"
    ]
  },
  {
    id: "6",
    name: "Price Action Rejections",
    tier: "intraday",
    desc: "Classic candlestick rejections (pin bars, double tops/bottoms) at major structural market inflection levels.",
    defaultTp1Mult: 1.5,
    defaultTp2Mult: 3.0,
    checklist: [
      "Range or mixed market regime",
      "Price tests a clear major level (support, resistance, or daily high/low)",
      "Formations: pin bar with long wick, double top / double bottom pattern",
      "Wick rejection size is at least 2x the body of the trigger candle",
      "Lower timeframe showing shift in trend character (rejection close)",
      "Stop Loss set tight above/below the rejection wick"
    ]
  },
  {
    id: "7",
    name: "VWAP Intraday",
    tier: "intraday",
    desc: "Utilizing volume-weighted average price as dynamic value support/resistance during high-volume sessions.",
    defaultTp1Mult: 1.5,
    defaultTp2Mult: 3.0,
    checklist: [
      "Liquid trading instrument with active volume (London/NY overlap)",
      "VWAP represents daily value, reset at 00:00 UTC",
      "Trend bias: price above VWAP indicates Bullish, below is Bearish",
      "Pullback: price retraces back to touch the dynamic VWAP line",
      "Inflection: rejection candle develops with clear tail/pin testing VWAP",
      "Entry placed on trigger high/low breakout with SL on opposing side"
    ]
  },
  {
    id: "8",
    name: "EMA Momentum Cross",
    tier: "intraday",
    desc: "Riding fast trend shifts triggered by EMA 20 crossing EMA 50, filtered by RSI filters.",
    defaultTp1Mult: 1.5,
    defaultTp2Mult: 2.0, // PLAYBOOK explicit 2.0R limit
    checklist: [
      "Trending market bias (ADX_14 > 20)",
      "Fast Crossover: EMA 20 crosses above EMA 50 (Bull) or below (Bear)",
      "RSI momentum filter: RSI > 55 (for Long entry) or < 45 (for Short entry)",
      "Price candle closes confidently in the crossover direction",
      "Stop Loss placed at the dynamic swing high/low pivot"
    ]
  },
  {
    id: "A",
    name: "1-Minute EMA + RSI + MACD Scalp",
    tier: "scalping",
    desc: "Rapid scalp targeting small targets on M1, following the M5 bias and MACD momentum.",
    defaultTp1Mult: 1.0, // 5 pips target
    defaultTp2Mult: 1.8, // 8-10 pips target
    checklist: [
      "ADX > 20 on the H5/M5 timeframe to filter out absolute noise",
      "M5 Trend stack is clear (EMA 7 > EMA 14)",
      "Pullback on M1 candle to touch EMA 7 or EMA 14 channel",
      "RSI pullback: temporary breath to <50 (but stays clean above 30) for longs",
      "MACD trigger: MACD histogram turns back up or line crosses signal upward",
      "Bullish trigger close above EMA 7",
      "Absolute minimum SL spacing of 3 pips configured",
      "Trade is closed inside 2-3 minutes if momentum stalls out"
    ]
  },
  {
    id: "B",
    name: "Gold Scalping with Asian Range Breakout",
    tier: "scalping",
    desc: "Entering early Gold (XAUUSD) breakout trades at London or NY open.",
    defaultTp1Mult: 1.5, // height of range
    defaultTp2Mult: 3.0,
    checklist: [
      "Instrument is XAUUSD or major volatile pair",
      "Asian Session (00:00-07:00 UTC) range metrics mapped",
      "Target Entry Hour: London open (07:00-09:00 UTC) or NY open (13:00-15:00 UTC) ONLY",
      "Breakout: price closes outside the Asian High or Asian Low on the M5 timeframe",
      "Bollinger Band width is actively expanding (bb_width_change > 1.5)",
      "Tick volume exceeds the 20-bar moving average",
      "Stop Loss is placed at conservative distance: inside range or 1.5x ATR"
    ]
  },
  {
    id: "C",
    name: "Previous Day Range Scalping",
    tier: "scalping",
    desc: "M5 breakouts of Previous Day High (PDH) or Previous Day Low (PDL) during high-volatility session openings.",
    defaultTp1Mult: 1.5,
    defaultTp2Mult: 3.0,
    checklist: [
      "PDH (Previous Day High) or PDL (Previous Day Low) clearly defined",
      "Trade executed during high volume London Open or NY Open",
      "Price breaks and closes beyond the PDH/PDL line on M5 chart",
      "Volatile candles without long counter-rejection wicks",
      "Tick volume supports the breakout push",
      "Stop Loss set inside the range or limited via 1.5x ATR distance"
    ]
  },
  {
    id: "D",
    name: "VWAP Scalping with Session Bias",
    tier: "scalping",
    desc: "Scalping rapid pullbacks to the daily reset VWAP on M5 chart.",
    defaultTp1Mult: 1.5,
    defaultTp2Mult: 2.5,
    checklist: [
      "Instrument has strong trading volume and volatility",
      "Active London or New York trading session",
      "Price is trading cleanly above VWAP (Bullish) or below (Bearish)",
      "Price drops back on M5 to retest the VWAP zone",
      "Pin bar rejection candle bounces cleanly off VWAP, indicating support",
      "Entry placed 1 unit beyond high of trigger candle, SL tight under VWAP"
    ]
  },
  {
    id: "E",
    name: "Breakout Swing from Daily/Weekly Range",
    tier: "swing",
    desc: "High-level breakouts of major multi-day consolidation bands on H4/D1.",
    defaultTp1Mult: 2.0, // swing structural targets
    defaultTp2Mult: 3.0,
    checklist: [
      "Major Daily/Weekly consolidation levels defined",
      "Price completes breakout with full H4 candle close beyond key resistance/support",
      "Daily Bollinger Bands are expanding, and volume is high",
      "Stop Loss is set conservatively (e.g. 2.0x ATR) to survive structural pullbacks",
      "Target is the measured move height of the multi-day range"
    ]
  },
  {
    id: "F",
    name: "Swing Trend Follow with EMA Stack",
    tier: "swing",
    desc: "Entering swing pullback alignments on H4 chart alongside Daily EMA and ADX trends.",
    defaultTp1Mult: 1.5,
    defaultTp2Mult: 3.0,
    checklist: [
      "High timeframe Daily trend confirmed (ADX_14 > 25)",
      "Daily EMA Stack is aligned (EMA 20 > 50 > 200)",
      "Retracement down to dynamic EMA 20 or EMA 50 on the H4 timeframe",
      "Bullish/Bearish candlestick structure forms (pin bar, morning star) on H4",
      "Stop Loss configured at wider swing structural low or 2.0x H4 ATR",
      "Trailing logic with H4 EMA 20 used for long-term swing exit tracking"
    ]
  },
  {
    id: "G",
    name: "Swing Mean Reversion in Ranges",
    tier: "swing",
    desc: "Fading multi-day extreme bands on H4 when general Daily bias is sideways (ADX_14 < 20).",
    defaultTp1Mult: 1.0, // BB Middle
    defaultTp2Mult: 2.0, // Opposite dynamic band
    checklist: [
      "Sideways Daily structure (Daily ADX_14 < 20)",
      "Daily Bollinger Bands are horizontal and stable",
      "Price reaches dynamic bands extreme on the H4 chart",
      "RSI extreme exhaustion witnessed on both H4 and Daily",
      "Pin-candle close inside the Bollinger channel",
      "Stop Loss set with wider breathing margins (1.5x Daily ATR)"
    ]
  },
  {
    id: "H",
    name: "Daily/Weekly Reversal at Major Levels",
    tier: "swing",
    desc: "Fading major structural horizontal supports/resistances on Daily/Weekly charts.",
    defaultTp1Mult: 2.0,
    defaultTp2Mult: 3.5,
    checklist: [
      "Inflection: level is identified from Weekly or Monthly charts",
      "Daily trend shows exhaustion as it approaches the S/R line",
      "Formations: obvious long-legged Doji, Pinbar, or Hammer candle on D1",
      "Rejection candle matches deep liquidity collection behind previous swing points",
      "Entry placed on Daily trigger high/low breakout with target at opposing zone"
    ]
  }
];

export const SUPPORTED_SYMBOLS: Record<string, SymbolSpec> = {
  XAUUSD: { name: "XAUUSD", display: "Gold (XAUUSD)", digits: 2, contractSize: 100, type: "metal" },
  EURUSD: { name: "EURUSD", display: "EURUSD", digits: 5, contractSize: 100000, type: "forex" },
  GBPUSD: { name: "GBPUSD", display: "GBPUSD", digits: 5, contractSize: 100000, type: "forex" },
  USDJPY: { name: "USDJPY", display: "USDJPY", digits: 3, contractSize: 100000, type: "forex" },
  AUDUSD: { name: "AUDUSD", display: "AUDUSD", digits: 5, contractSize: 100000, type: "forex" },
  USDCAD: { name: "USDCAD", display: "USDCAD", digits: 5, contractSize: 100000, type: "forex" },
  BTCUSD: { name: "BTCUSD", display: "Bitcoin (BTCUSD)", digits: 2, contractSize: 1, type: "crypto" },
  ETHUSD: { name: "ETHUSD", display: "Ethereum (ETHUSD)", digits: 2, contractSize: 1, type: "crypto" },
};
export const TIMEFRAMES = ["M1", "M5", "M15", "H1", "H4", "D1"];
