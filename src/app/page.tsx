"use client";

import { PortfolioSummaryCard } from "@/components/PortfolioSummaryCard";
import { PortfolioTable } from "@/components/PortfolioTable";
import { SectorGrouping } from "@/components/SectorGrouping";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePortfolio } from "@/hooks/usePortfolio";
import { cn } from "@/lib/utils";
import { Building2, RefreshCw, Table } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export default function Home() {
  const {
    holdings,
    sectorSummaries,
    portfolioSummary,
    staticSectorData,
    staticPortfolioSummary,
    isUpdating,
    refreshData,
  } = usePortfolio();
  const { setTheme } = useTheme();

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
              <p className="text-muted-foreground mt-1">
                Real portfolio data with live market simulation
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={refreshData}
                disabled={isUpdating}
                className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4 mr-2 transition-transform duration-300",
                    isUpdating && "animate-spin"
                  )}
                />
                {isUpdating ? "Updating..." : "Refresh Data"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <PortfolioSummaryCard
          summary={staticPortfolioSummary}
          isUpdating={isUpdating}
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
            <PortfolioTable holdings={holdings} isUpdating={isUpdating} />
          </TabsContent>

          <TabsContent value="sectors" className="space-y-6">
            <SectorGrouping
              sectorSummaries={sectorSummaries}
              isUpdating={isUpdating}
            />
          </TabsContent>
        </Tabs>

        <div className="fixed bottom-4 right-4">
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-full border shadow-elegant transition-all duration-300 bg-card",
              isUpdating
                ? "border-primary text-primary"
                : "border-border text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                isUpdating
                  ? "bg-primary animate-pulse"
                  : "bg-green-600 dark:bg-green-400"
              )}
            />
            <span className="text-sm font-medium">
              {isUpdating ? "Updating prices..." : "Live data active"}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
