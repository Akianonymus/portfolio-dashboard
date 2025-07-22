import * as cheerio from "cheerio";

export interface GoogleFinanceData {
  peRatio?: string;
  eps?: string;
  epsPeriod?: string;
  symbol: string;
  exchange: string;
}

export async function getStockDataBySymbolGoogle(
  symbol: string | undefined | null,
  exchange: string = "NSE"
): Promise<GoogleFinanceData | null> {
  try {
    if (!symbol) {
      return null;
    }

    switch (exchange) {
      case "NSI":
        exchange = "NSE";
        break;
    }

    const url = `https://www.google.com/finance/quote/${encodeURIComponent(
      symbol
    )}:${encodeURIComponent(exchange)}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/115.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const result: GoogleFinanceData = {
      symbol,
      exchange,
    };

    // Parse P/E ratio
    const peLabelDiv = $("div.mfs7Fc")
      .filter((i, el) => $(el).text().trim() === "P/E ratio")
      .first();
    if (peLabelDiv.length > 0) {
      const peValueDiv = peLabelDiv.parent("span").next("div.P6K39c");
      if (peValueDiv.length > 0) {
        result.peRatio = peValueDiv.text().trim();
      }
    }

    // Parse Earnings per share from the financial table
    const epsRow = $("tr.roXhBd")
      .filter((i, el) => {
        const text = $(el).find("div.rsPbEe").text().trim();
        return text === "Earnings per share";
      })
      .first();

    if (epsRow.length > 0) {
      const epsValue = epsRow.find("td.QXDnM").text().trim();
      if (epsValue) {
        result.eps = epsValue;
      }
    }

    // Parse period information from the table header
    // Try multiple approaches to find the period
    let periodFound = false;

    // Approach 1: Look for th.yNnsfe with month-year pattern
    const periodHeaders = $("th.yNnsfe");

    periodHeaders.each((i, el) => {
      const text = $(el).text().trim();

      // More flexible regex to match various period formats
      if (
        /^[A-Za-z]{3}\s+\d{4}$/.test(text) ||
        /^[A-Za-z]+\s+\d{4}$/.test(text)
      ) {
        result.epsPeriod = text;
        periodFound = true;
        return false; // break the loop
      }
    });

    // Approach 2: Look for any element containing period-like text
    if (!periodFound) {
      const allElements = $("*");
      allElements.each((i, el) => {
        const text = $(el).text().trim();
        // Look for patterns like "Mar 2025", "March 2025", "Q1 2025", etc.
        if (/^[A-Za-z]{3,}\s+\d{4}$/.test(text) && text.length < 20) {
          // Avoid very long text that might be descriptions
          result.epsPeriod = text;
          periodFound = true;
          return false; // break the loop
        }
      });
    }

    // Approach 3: Look specifically in table headers for any date-like content
    if (!periodFound) {
      const tableHeaders = $("th");
      tableHeaders.each((i, el) => {
        const text = $(el).text().trim();
        // Look for any year in the 2000-2099 range, not just specific years
        if (/\b20\d{2}\b/.test(text)) {
          // Extract just the period part if it's mixed with other text
          const periodMatch = text.match(/([A-Za-z]{3,}\s+\d{4})/);
          if (periodMatch) {
            result.epsPeriod = periodMatch[1];
            periodFound = true;
            return false; // break the loop
          }
        }
      });
    }

    if (!periodFound) {
      console.log(`Period not found with any approach ${symbol} ${exchange}`);
    }

    return result;
  } catch (error) {
    console.error("Error fetching Google Finance data:", error);
    return null;
  }
}
