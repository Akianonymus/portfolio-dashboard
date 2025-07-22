import { PortfolioSummary } from "@/types/portfolio";
import { TrendingUp, TrendingDown, DollarSign, Clock } from "lucide-react";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

interface PortfolioSummaryCardProps {
  summary: PortfolioSummary;
  isUpdating: boolean;
}

export const PortfolioSummaryCard = ({
  summary,
  isUpdating,
}: PortfolioSummaryCardProps) => {
  const isGain = summary.totalGainLoss >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Investment
          </CardTitle>
          <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(summary.totalInvestment)}
          </div>
        </CardContent>
      </Card>

      <Card className=" shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Present Value
          </CardTitle>
          <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold transition-all duration-300")}>
            {formatCurrency(summary.totalPresentValue)}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Gain/Loss
          </CardTitle>
          {isGain ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "text-2xl font-bold transition-all duration-300",
              isGain ? "text-green-600" : "text-red-600"
            )}
          >
            {formatCurrency(summary.totalGainLoss)}
          </div>
          <p
            className={cn(
              "text-xs font-medium",
              isGain ? "text-green-600" : "text-red-600"
            )}
          >
            {formatPercentage(summary.gainLossPercentage)}
          </p>
        </CardContent>
      </Card>

      <Card className=" shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Last Updated
          </CardTitle>
          <Clock
            className={cn(
              "h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-300",
              isUpdating && "animate-spin"
            )}
          />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {summary.lastUpdated.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {summary.lastUpdated.toLocaleDateString("en-IN")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
