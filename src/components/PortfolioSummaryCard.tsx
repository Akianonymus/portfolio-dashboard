"use client";

import { PortfolioSummary } from "@/types/portfolio";
import { TrendingUp, TrendingDown, DollarSign, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "./ui/card";

interface PortfolioSummaryCardProps {
  summary: PortfolioSummary;
  isUpdating: boolean;
  isDynamicDataLoading?: boolean;
}

export const PortfolioSummaryCard = ({
  summary,
  isUpdating,
  isDynamicDataLoading = false,
}: PortfolioSummaryCardProps) => {
  const isGain = summary.totalGainLoss >= 0;
  const lastUpdated = summary?.lastUpdated
    ? new Date(summary?.lastUpdated)
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="shadow-md">
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-4 text-gray-500 dark:text-gray-400">
              Total Investment
              <DollarSign />
            </div>
            <div className="text-2xl font-bold">
              <AnimatedNumber
                value={summary.totalInvestment}
                format="currency"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-4 text-gray-500 dark:text-gray-400">
              Present Value
              <DollarSign />
            </div>
            <div
              className={cn(
                "text-2xl font-bold",
                isGain ? "text-green-600" : "text-red-600"
              )}
            >
              {isDynamicDataLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <AnimatedNumber
                  value={summary.totalPresentValue}
                  format="currency"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-4 text-gray-500 dark:text-gray-400">
              Total {isGain ? "Gain" : "Loss"}
              {isGain ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="flex items-center justify-between gap-4">
              {isDynamicDataLoading ? (
                <>
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-6 w-16" />
                </>
              ) : (
                <>
                  <div
                    className={cn(
                      "text-2xl font-bold",
                      isGain ? "text-green-600" : "text-red-600"
                    )}
                  >
                    <AnimatedNumber
                      value={summary.totalGainLoss}
                      format="currency"
                    />
                  </div>
                  <div
                    className={cn(
                      "text-lg font-medium ml-2",
                      isGain ? "text-green-600" : "text-red-600"
                    )}
                  >
                    <AnimatedNumber
                      value={summary.gainLossPercentage}
                      format="percentage"
                      decimals={2}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-4 text-gray-500 dark:text-gray-400">
              Last Updated
              <Clock
                className={cn(
                  "h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300",
                  isUpdating && "animate-spin"
                )}
              />
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {lastUpdated?.toLocaleDateString?.("en-IN")},{" "}
              {lastUpdated?.toLocaleTimeString?.("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
