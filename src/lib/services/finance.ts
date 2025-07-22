import { getStockDataBySymbolGoogle } from "./googleFinance";
import { getStockDataByNameYahoo } from "./yahooFinance";

// Get batch stock data by names
export const getBatchStockDataByName = async (names: string[]) => {
  const results = await Promise.all(
    names.map(async (name) => {
      const result1 = await getStockDataByNameYahoo(name);

      const result2 = await getStockDataBySymbolGoogle(
        result1.data?.symbol,
        result1.data?.exchange
      );

      return {
        name,
        symbol: result1.success ? result1.data?.symbol || null : null,
        success: result1.success,
        data: result1.success ? result1.data : undefined,
        data2: result2,
        error: result1.success ? undefined : "",
      };
    })
  );

  return results;
};
