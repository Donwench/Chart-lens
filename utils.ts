import { SUPPORTED_SYMBOLS } from "./data";

export interface PositionSizeResult {
  lots: number;
  riskAmount: number;
  pipDistance: number;
  slPriceDistance: number;
  potentialTp1Usd: number;
  potentialTp2Usd: number;
  ratioTp1: number;
  ratioTp2: number;
}

/**
 * Calculates correct trading lot size, pips, and risk to reward stats.
 */
export function calculatePositionStats(
  symbolName: string,
  entry: number,
  sl: number,
  tp1: number,
  tp2: number,
  balance: number,
  riskPct: number,
  direction: 'BUY' | 'SELL' | 'NO_TRADE'
): PositionSizeResult {
  const cleanSymbol = symbolName.toUpperCase().replace('M', ''); // EURUSDm -> EURUSD
  const spec = SUPPORTED_SYMBOLS[cleanSymbol] || {
    name: symbolName,
    display: symbolName,
    digits: 5,
    contractSize: 100000,
    type: "forex",
  };

  const riskAmount = balance * (riskPct / 100);
  const slPriceDistance = Math.abs(entry - sl);
  const tp1PriceDistance = Math.abs(entry - tp1);
  const tp2PriceDistance = Math.abs(entry - tp2);

  const fallbackResult: PositionSizeResult = {
    lots: 0,
    riskAmount,
    pipDistance: 0,
    slPriceDistance: 0,
    potentialTp1Usd: 0,
    potentialTp2Usd: 0,
    ratioTp1: 0,
    ratioTp2: 0,
  };

  if (slPriceDistance === 0 || direction === 'NO_TRADE') {
    return fallbackResult;
  }

  // Calculate Pip Distance
  let pipDistance = 0;
  if (spec.type === 'metal') {
    // Gold: $1 USD change = 10 pips (standard gold pip is $0.10)
    pipDistance = slPriceDistance * 10;
  } else if (spec.type === 'crypto') {
    // Crypto: $1 USD change = 1 pip
    pipDistance = slPriceDistance;
  } else {
    // Forex:
    const isJpy = cleanSymbol.endsWith('JPY');
    const pipSize = isJpy ? 0.01 : 0.0001;
    pipDistance = slPriceDistance / pipSize;
  }

  let lots = 0;

  if (spec.type === 'metal') {
    // For Gold: Contract size = 100 oz. Lots = RiskUSD / (Distance * ContractSize)
    lots = riskAmount / (slPriceDistance * spec.contractSize);
  } else if (spec.type === 'crypto') {
    // Crypto: Contract size = 1. Lots = RiskUSD / Distance
    lots = riskAmount / slPriceDistance;
  } else {
    // Forex pairs
    const isJpy = cleanSymbol.endsWith('JPY');
    if (isJpy) {
      // JPY pair standard. Pip size: 0.01.
      // 1 lot of EURJPY = 100,000 EUR. 0.01 pip value = 1000 JPY.
      // Convert to USD using JPYUSD rate. Let's assume average dynamic USDJPY conversion rate: 155.0
      const assumedRate = 155.0;
      const pipValueUsd = (0.01 / assumedRate) * spec.contractSize;
      lots = riskAmount / (pipDistance * pipValueUsd);
    } else {
      // Direct USD pairs (EURUSD, GBPUSD, AUDUSD, etc.):
      // 1 lot pip value is exactly $10 USD (since 0.0001 * 100,000 = 10)
      lots = riskAmount / (slPriceDistance * spec.contractSize);
    }
  }

  // Round lots to 2 decimal places
  lots = Math.round(lots * 100) / 100;
  if (lots < 0.01 && lots > 0) lots = 0.01;

  // Potential earnings in USD based on exact lots and distances
  let potentialTp1Usd = 0;
  let potentialTp2Usd = 0;

  if (spec.type === 'metal') {
    potentialTp1Usd = lots * tp1PriceDistance * spec.contractSize;
    potentialTp2Usd = lots * tp2PriceDistance * spec.contractSize;
  } else if (spec.type === 'crypto') {
    potentialTp1Usd = lots * tp1PriceDistance;
    potentialTp2Usd = lots * tp2PriceDistance;
  } else {
    const isJpy = cleanSymbol.endsWith('JPY');
    if (isJpy) {
      const assumedRate = 155.0;
      const pipValueUsd = (0.01 / assumedRate) * spec.contractSize;
      const tp1Pips = tp1PriceDistance / 0.01;
      const tp2Pips = tp2PriceDistance / 0.01;
      potentialTp1Usd = lots * tp1Pips * pipValueUsd;
      potentialTp2Usd = lots * tp2Pips * pipValueUsd;
    } else {
      potentialTp1Usd = lots * tp1PriceDistance * spec.contractSize;
      potentialTp2Usd = lots * tp2PriceDistance * spec.contractSize;
    }
  }

  // Calculate R-to-R Ratios
  const ratioTp1 = slPriceDistance > 0 ? Number((tp1PriceDistance / slPriceDistance).toFixed(2)) : 0;
  const ratioTp2 = slPriceDistance > 0 ? Number((tp2PriceDistance / slPriceDistance).toFixed(2)) : 0;

  return {
    lots,
    riskAmount: Number(riskAmount.toFixed(2)),
    pipDistance: Math.round(pipDistance * 10) / 10,
    slPriceDistance,
    potentialTp1Usd: Number(potentialTp1Usd.toFixed(2)),
    potentialTp2Usd: Number(potentialTp2Usd.toFixed(2)),
    ratioTp1,
    ratioTp2,
  };
}

/**
 * Helper to display dynamic price values formatting based on symbol digits
 */
export function formatPrice(price: number, digits: number = 2): string {
  if (isNaN(price)) return '0.00';
  return price.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/**
 * Format money values
 */
export function formatMoney(amount: number): string {
  if (isNaN(amount)) return '$0.00';
  return amount.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
  });
}

/**
 * Return MQL5 order placement code template
 */
export function generateMql5Code(
  symbol: string,
  direction: 'BUY' | 'SELL' | 'NO_TRADE',
  lots: number,
  entry: number,
  sl: number,
  tp1: number,
  tp2: number,
  strategyName: string
): string {
  if (direction === 'NO_TRADE') {
    return "// No trade signal recommended. MQL5 order snippet not generated.";
  }

  const opType = direction === 'BUY' ? 'ORDER_TYPE_BUY_LIMIT' : 'ORDER_TYPE_SELL_LIMIT';
  const opTypeMarket = direction === 'BUY' ? 'ORDER_TYPE_BUY' : 'ORDER_TYPE_SELL';
  const magicNum = Math.floor(100000 + Math.random() * 900000);

  return `// ─────────────────────────────────────────────────────────────
// MT5 AI SIGNAL SNIPPET — ${strategyName.toUpperCase()}
// Paste this directly into your MT5 EA script or console
// ─────────────────────────────────────────────────────────────
#include <Trade\\Trade.mqh>
CTrade trade;

void OnStart()
{
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   string symbol = "${symbol}";
   double entryPrice = ${entry};
   double stopLoss = ${sl};
   double takeProfit1 = ${tp1};
   double takeProfit2 = ${tp2};
   double lotVolume = ${lots};
   
   // Set client identifier magic number
   trade.SetExpertMagicNumber(${magicNum});
   
   Print("AI Signal Executing: ${direction} on " + symbol + " | Lot: " + DoubleToString(lotVolume, 2));
   
   // Place pending limit orders at the dynamic entry zones
   if(trade.PendingOrderPlace(symbol, ${opType}, lotVolume, entryPrice, entryPrice, stopLoss, takeProfit1, ORDER_TIME_GTC, 0))
   {
      Print("MQL5 Pending order placed successfully! Magic: ${magicNum}");
   }
   else
   {
      Print("Error placing pending order, error code: ", GetLastError());
      
      // Secondary execution attempt: executing instant market order if price already within limits
      Print("Attempting market execution...");
      trade.PositionOpen(symbol, ${opTypeMarket}, lotVolume, SymbolInfoDouble(symbol, SYMBOL_ASK), stopLoss, takeProfit1, "AI Auto Execution");
   }
}`;
}
