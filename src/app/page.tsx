"use client";

import { PortfolioSummaryCard } from "@/components/PortfolioSummaryCard";
import { PortfolioTable } from "@/components/PortfolioTable";
import { SectorGrouping } from "@/components/SectorGrouping";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStaticPortfolio } from "@/hooks/useStaticPortfolio";
import { useDynamicData } from "@/hooks/useDynamicData";
import { cn } from "@/lib/utils";
import { Building2, RefreshCw, Table, Database } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const { setTheme } = useTheme();

  const {
    holdings: staticHoldings,
    sectorSummaries: staticSectorSummaries,
    portfolioSummary: staticPortfolioSummary,
    isLoading: isStaticLoading,
    error: staticError,
    refreshStaticPortfolio,
  } = useStaticPortfolio();

  // Extract stock names for dynamic data fetching
  const stockNames = useMemo(() => {
    return staticHoldings.map((holding) => holding.name);
  }, [staticHoldings]);

  // Fetch dynamic data
  const {
    holdings: dynamicHoldings,
    sectorSummaries: dynamicSectorSummaries,
    portfolioSummary: dynamicPortfolioSummary,
    isLoading: isDynamicLoading,
    isUpdating: isDynamicUpdating,
    error: dynamicError,
    refreshDynamicData,
  } = useDynamicData(stockNames);

  // Use dynamic data if available, otherwise fall back to static data
  const holdings = useMemo(() => {
    return dynamicHoldings.length > 0 ? dynamicHoldings : staticHoldings;
  }, [dynamicHoldings, staticHoldings]);

  const sectorSummaries = useMemo(() => {
    return dynamicSectorSummaries.length > 0
      ? dynamicSectorSummaries
      : staticSectorSummaries;
  }, [dynamicSectorSummaries, staticSectorSummaries]);

  const portfolioSummary = useMemo(() => {
    return dynamicHoldings.length > 0
      ? dynamicPortfolioSummary
      : staticPortfolioSummary;
  }, [dynamicHoldings.length, dynamicPortfolioSummary, staticPortfolioSummary]);

  // Loading states
  const isLoading =
    isStaticLoading || (isDynamicLoading && stockNames.length > 0);
  const isUpdating = isDynamicUpdating;
  const error = staticError || dynamicError;
  const hasDynamicData = dynamicHoldings.length > 0;

  // Refresh function
  const refreshPortfolio = () => {
    refreshStaticPortfolio();
    refreshDynamicData();
  };

  useEffect(() => {
    setTheme("dark");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card border-b border-border shadow-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text">
                Portfolio Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button
                onClick={refreshPortfolio}
                disabled={isLoading || isUpdating}
                variant="outline"
                className="cursor-pointer"
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4 mr-2 transition-transform duration-300",
                    (isLoading || isUpdating) && "animate-spin"
                  )}
                />
                Refresh Portfolio
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {isLoading && holdings?.length <= 0 ? (
          <LoadingSpinner message="Loading portfolio data..." />
        ) : (
          <>
            <PortfolioSummaryCard
              summary={portfolioSummary}
              isUpdating={isUpdating}
              isDynamicDataLoading={isDynamicLoading}
            />

            <Tabs defaultValue="table" className="space-y-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="table"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Table className="h-4 w-4" />
                  Portfolio Holdings
                </TabsTrigger>
                <TabsTrigger
                  value="sectors"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Building2 className="h-4 w-4" />
                  Sector Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="table" className="space-y-6">
                <PortfolioTable
                  holdings={holdings}
                  isUpdating={isUpdating}
                  isDynamicDataLoading={isDynamicLoading}
                  hasDynamicData={hasDynamicData}
                />
              </TabsContent>

              <TabsContent value="sectors" className="space-y-6">
                <SectorGrouping
                  sectorSummaries={sectorSummaries}
                  isUpdating={isUpdating}
                />
              </TabsContent>
            </Tabs>
          </>
        )}

        {!isLoading && (
          <div className="fixed bottom-4 right-4">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full border shadow-elegant transition-all duration-300 bg-card",
                isUpdating
                  ? "border-primary text-primary"
                  : hasDynamicData
                  ? "border-green-500 text-green-600 dark:text-green-400"
                  : "border-yellow-500 text-yellow-600 dark:text-yellow-400"
              )}
            >
              <div className="flex items-center gap-2">
                {isUpdating ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : hasDynamicData ? (
                  <Database className="h-3 w-3" />
                ) : (
                  <Table className="h-3 w-3" />
                )}
                <span className="text-xs font-medium">
                  {isUpdating
                    ? "Updating..."
                    : hasDynamicData
                    ? "Live Data"
                    : "Static Data"}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
