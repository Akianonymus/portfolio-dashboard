import { useState, useEffect } from "react";
import { SectorSummary } from "@/types/portfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Building2,
} from "lucide-react";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";

interface SectorGroupingProps {
  sectorSummaries: SectorSummary[];
  isUpdating: boolean;
}

export const SectorGrouping = ({
  sectorSummaries,
  isUpdating,
}: SectorGroupingProps) => {
  const [openSectors, setOpenSectors] = useState<Set<string>>(new Set());

  useEffect(() => {
    const allSectorNames = new Set(sectorSummaries.map((s) => s.name));
    setOpenSectors(allSectorNames);
  }, [sectorSummaries]);

  const toggleSector = (sectorName: string) => {
    const newOpenSectors = new Set(openSectors);
    if (newOpenSectors.has(sectorName)) {
      newOpenSectors.delete(sectorName);
    } else {
      newOpenSectors.add(sectorName);
    }
    setOpenSectors(newOpenSectors);
  };

  const getSectorIcon = (sectorName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      Technology: "💻",
      "Financial Services": "🏦",
      "Consumer Goods": "🛍️",
      Pharmaceuticals: "💊",
      Energy: "⚡",
      Power: "⚡",
      Pipe: "🔧",
      Others: "📦",
    };
    return iconMap[sectorName] || "🏢";
  };

  // Tailwind classes for gain/loss
  const gainTextClass = "text-green-600 dark:text-green-400";
  const lossTextClass = "text-red-600 dark:text-red-400";

  return (
    <div className="space-y-4 w-full">
      {sectorSummaries.map((sector) => {
        const isGain = sector.totalGainLoss >= 0;
        const isOpen = openSectors.has(sector.name);

        return (
          <Card key={sector.name} className="bg-card border-border shadow-card">
            <Collapsible
              open={isOpen}
              onOpenChange={() => toggleSector(sector.name)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-2xl">
                          {getSectorIcon(sector.name)}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-foreground">
                          {sector.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {sector.holdings.length} stocks
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Investment
                        </p>
                        <p className="font-semibold text-foreground">
                          {formatCurrency(sector.totalInvestment)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Present Value
                        </p>
                        <p
                          className={cn(
                            "font-semibold transition-all duration-300"
                          )}
                        >
                          {formatCurrency(sector.totalPresentValue)}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          {isGain ? (
                            <TrendingUp
                              className={`h-4 w-4 ${gainTextClass}`}
                            />
                          ) : (
                            <TrendingDown
                              className={`h-4 w-4 ${lossTextClass}`}
                            />
                          )}
                          <p className="text-sm text-muted-foreground">
                            Gain/Loss
                          </p>
                        </div>
                        <p
                          className={cn(
                            "font-bold transition-all duration-300",
                            isGain ? gainTextClass : lossTextClass
                          )}
                        >
                          {formatCurrency(sector.totalGainLoss)}
                        </p>
                        <p
                          className={cn(
                            "text-xs",
                            isGain ? gainTextClass : lossTextClass
                          )}
                        >
                          ({formatPercentage(sector.gainLossPercentage)})
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {sector.holdings.map((holding) => {
                      const holdingIsGain = holding.gainLoss >= 0;

                      return (
                        <div
                          key={holding.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium text-foreground">
                                {holding.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {holding.symbol}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {holding.exchange}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-right">
                              <p className="text-muted-foreground">Qty</p>
                              <p className="font-medium">{holding.quantity}</p>
                            </div>

                            <div className="text-right">
                              <p className="text-muted-foreground">CMP</p>
                              <p
                                className={cn(
                                  "font-medium transition-all duration-300"
                                )}
                              >
                                {formatCurrency(holding.currentPrice)}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-muted-foreground">Value</p>
                              <p
                                className={cn(
                                  "font-medium transition-all duration-300"
                                )}
                              >
                                {formatCurrency(holding.presentValue)}
                              </p>
                            </div>

                            <div className="text-right">
                              <div className="flex items-center gap-1 justify-end">
                                {holdingIsGain ? (
                                  <TrendingUp
                                    className={`h-3 w-3 ${gainTextClass}`}
                                  />
                                ) : (
                                  <TrendingDown
                                    className={`h-3 w-3 ${lossTextClass}`}
                                  />
                                )}
                                <p className="text-muted-foreground">P&L</p>
                              </div>
                              <p
                                className={cn(
                                  "font-medium transition-all duration-300",
                                  holdingIsGain ? gainTextClass : lossTextClass
                                )}
                              >
                                {formatCurrency(holding.gainLoss)}
                              </p>
                              <p
                                className={cn(
                                  "text-xs",
                                  holdingIsGain ? gainTextClass : lossTextClass
                                )}
                              >
                                ({formatPercentage(holding.gainLossPercentage)})
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-muted-foreground">P/E</p>
                              <p className="font-medium">{holding.peRatio}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
};
