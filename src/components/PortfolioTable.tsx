"use client";

import { useState, useMemo } from "react";
import { PortfolioHolding } from "@/types/portfolio";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import {
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  Table,
} from "./ui/table";

interface StockLoadingState {
  stockName: string;
  isLoading: boolean;
  isFetching: boolean;
  hasData: boolean;
  error: any;
}

interface PortfolioTableProps {
  holdings: PortfolioHolding[];
  isUpdating: boolean;
  isDynamicDataLoading?: boolean;
  hasDynamicData?: boolean;
  stockLoadingStates?: StockLoadingState[];
}

type SortField =
  | "name"
  | "purchasePrice"
  | "quantity"
  | "investment"
  | "portfolioPercentage"
  | "currentPrice"
  | "presentValue"
  | "gainLoss"
  | "gainLossPercentage"
  | "peRatio"
  | "latestEarnings";
type SortDirection = "asc" | "desc";

// Extracted components for better organization
const SortableHeader = ({
  field,
  children,
  sortField,
  sortDirection,
  onSort,
}: {
  field: SortField;
  children: React.ReactNode;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}) => (
  <TableHead
    className="cursor-pointer hover:bg-muted/50 transition-colors"
    onClick={() => onSort(field)}
  >
    <div className="flex items-center gap-2">
      {children}
      {sortField === field ? (
        sortDirection === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
      )}
    </div>
  </TableHead>
);

const LoadingSkeleton = ({ width = "w-16" }: { width?: string }) => (
  <Skeleton className={cn("h-4", width)} />
);

const StockInfo = ({ holding }: { holding: PortfolioHolding }) => (
  <div className="flex flex-col">
    <div className="font-medium text-foreground">{holding.name}</div>
    <div className="flex gap-2 mt-1">
      <Badge variant="outline" className="w-fit text-xs">
        {holding.symbol || holding.name}
      </Badge>
      <Badge variant="secondary" className="w-fit text-xs">
        {holding.sector}
      </Badge>
    </div>
  </div>
);

const CurrentPriceCell = ({
  holding,
  hasDynamic,
  isLoading,
  hasPreviousData,
}: {
  holding: PortfolioHolding;
  hasDynamic: boolean;
  isLoading: boolean;
  hasPreviousData: boolean;
}) => {
  const isGain = holding.gainLoss >= 0;
  const priceContent = (
    <div className="flex items-center gap-1">
      {hasDynamic &&
        (isGain ? (
          <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
        ) : (
          <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
        ))}
      <AnimatedNumber value={holding.currentPrice} format="currency" />
    </div>
  );

  if (isLoading) {
    return hasPreviousData ? (
      <div className="flex items-center gap-2 animate-pulse">
        {priceContent}
      </div>
    ) : (
      <LoadingSkeleton width="w-16" />
    );
  }

  return priceContent;
};

const GainLossCell = ({
  holding,
  hasDynamic,
  isLoading,
  hasPreviousData,
}: {
  holding: PortfolioHolding;
  hasDynamic: boolean;
  isLoading: boolean;
  hasPreviousData: boolean;
}) => {
  const isGain = holding.gainLoss >= 0;
  const gainLossContent = (
    <div className="flex flex-col">
      <span>
        <AnimatedNumber value={holding.gainLoss} format="currency" />
      </span>
      <span className="text-xs">
        (
        <AnimatedNumber
          value={holding.gainLossPercentage}
          format="percentage"
          decimals={2}
        />
        )
      </span>
    </div>
  );

  if (isLoading) {
    return hasPreviousData ? (
      <div className="flex flex-col gap-2 animate-pulse">{gainLossContent}</div>
    ) : (
      <div className="flex flex-col gap-1">
        <LoadingSkeleton width="w-16" />
        <LoadingSkeleton width="w-12" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "font-bold  duration-300",
        isGain
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400"
      )}
    >
      {gainLossContent}
    </div>
  );
};

const EarningsCell = ({
  holding,
  isLoading,
  hasPreviousData,
}: {
  holding: PortfolioHolding;
  isLoading: boolean;
  hasPreviousData: boolean;
}) => {
  const hasEarnings =
    holding.latestEarnings?.period &&
    typeof holding.latestEarnings.amount === "number" &&
    holding.latestEarnings.amount !== 0;

  const earningsContent = hasEarnings ? (
    <div className="flex flex-col">
      <div className="text-xs">{holding.latestEarnings!.period}</div>
      <div className="text-sm">
        {holding.latestEarnings!.type === "total" ? (
          <AnimatedNumber
            value={holding.latestEarnings!.amount}
            format="currency"
          />
        ) : (
          <AnimatedNumber
            value={holding.latestEarnings!.amount}
            format="decimal"
            decimals={2}
          />
        )}
      </div>
    </div>
  ) : null;

  if (isLoading) {
    return hasPreviousData && hasEarnings ? (
      <div className="flex flex-col gap-2 animate-pulse">{earningsContent}</div>
    ) : (
      <div className="flex flex-col gap-1">
        <LoadingSkeleton width="w-8" />
        <LoadingSkeleton width="w-12" />
      </div>
    );
  }

  return earningsContent;
};

export const PortfolioTable = ({
  holdings,
  isUpdating,
  isDynamicDataLoading = false,
  hasDynamicData = false,
  stockLoadingStates = [],
}: PortfolioTableProps) => {
  const [sortField, setSortField] = useState<SortField>("investment");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Memoize sorted holdings for better performance
  const sortedHoldings = useMemo(() => {
    return [...holdings].sort((a, b) => {
      if (sortField === "latestEarnings") {
        const aAmount = a.latestEarnings?.amount ?? 0;
        const bAmount = b.latestEarnings?.amount ?? 0;
        return sortDirection === "asc" ? aAmount - bAmount : bAmount - aAmount;
      }

      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [holdings, sortField, sortDirection]);

  // Memoize loading state lookup for better performance
  const getStockLoadingState = useMemo(
    () => (stockName: string) =>
      stockLoadingStates.find((state) => state.stockName === stockName),
    [stockLoadingStates]
  );

  const hasDynamicDataForHolding = (holding: PortfolioHolding) => {
    const loadingState = getStockLoadingState(holding.name);
    return (
      hasDynamicData &&
      holding.currentPrice > 0 &&
      (loadingState?.hasData ?? false)
    );
  };

  const isStockLoading = (holding: PortfolioHolding) => {
    const loadingState = getStockLoadingState(holding.name);
    return (
      (loadingState?.isLoading ?? false) || (loadingState?.isFetching ?? false)
    );
  };

  const hasPreviousData = (holding: PortfolioHolding) => {
    const loadingState = getStockLoadingState(holding.name);
    return (loadingState?.hasData ?? false) || holding.currentPrice > 0;
  };

  return (
    <Card className="bg-card border-border shadow-card w-full">
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <SortableHeader
                  field="name"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Stock
                </SortableHeader>
                <SortableHeader
                  field="purchasePrice"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Purchase Price
                </SortableHeader>
                <SortableHeader
                  field="quantity"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Qty
                </SortableHeader>
                <SortableHeader
                  field="investment"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Investment
                </SortableHeader>
                <SortableHeader
                  field="portfolioPercentage"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Portfolio %
                </SortableHeader>
                <TableHead>Exchange</TableHead>
                <SortableHeader
                  field="currentPrice"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  CMP
                </SortableHeader>
                <SortableHeader
                  field="presentValue"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Present Value
                </SortableHeader>
                <SortableHeader
                  field="gainLoss"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Gain/Loss
                </SortableHeader>
                <SortableHeader
                  field="peRatio"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  P/E Ratio
                </SortableHeader>
                <SortableHeader
                  field="latestEarnings"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Latest Earnings
                </SortableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHoldings.map((holding) => {
                const hasDynamic = hasDynamicDataForHolding(holding);
                const isLoading = isStockLoading(holding);
                const hasPrevious = hasPreviousData(holding);

                return (
                  <TableRow
                    key={holding.id}
                    className="border-border hover:bg-muted/50 transition-colors"
                  >
                    <TableCell>
                      <StockInfo holding={holding} />
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      <AnimatedNumber
                        value={holding.purchasePrice}
                        format="currency"
                      />
                    </TableCell>

                    <TableCell className="text-foreground font-medium">
                      <AnimatedNumber
                        value={holding.quantity}
                        format="number"
                        decimals={0}
                      />
                    </TableCell>

                    <TableCell className="text-foreground font-medium">
                      <AnimatedNumber
                        value={holding.investment}
                        format="currency"
                      />
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {isLoading ? (
                        hasPrevious ? (
                          <div className="flex items-center gap-2 animate-pulse">
                            <AnimatedNumber
                              value={holding.portfolioPercentage}
                              format="percentage"
                              decimals={1}
                            />
                          </div>
                        ) : (
                          <LoadingSkeleton width="w-12" />
                        )
                      ) : (
                        <AnimatedNumber
                          value={holding.portfolioPercentage}
                          format="percentage"
                          decimals={1}
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {holding.exchange}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-medium transition-all duration-300">
                      <CurrentPriceCell
                        holding={holding}
                        hasDynamic={hasDynamic}
                        isLoading={isLoading}
                        hasPreviousData={hasPrevious}
                      />
                    </TableCell>

                    <TableCell className="font-medium transition-all duration-300">
                      {isLoading ? (
                        hasPrevious ? (
                          <div className="flex items-center gap-2 animate-pulse">
                            <AnimatedNumber
                              value={holding.presentValue}
                              format="currency"
                            />
                          </div>
                        ) : (
                          <LoadingSkeleton width="w-20" />
                        )
                      ) : (
                        <AnimatedNumber
                          value={holding.presentValue}
                          format="currency"
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      <GainLossCell
                        holding={holding}
                        hasDynamic={hasDynamic}
                        isLoading={isLoading}
                        hasPreviousData={hasPrevious}
                      />
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {isLoading ? (
                        hasPrevious ? (
                          <div className="flex items-center gap-2 animate-pulse">
                            <AnimatedNumber
                              value={holding.peRatio}
                              format="decimal"
                              decimals={2}
                            />
                          </div>
                        ) : (
                          <LoadingSkeleton width="w-12" />
                        )
                      ) : (
                        <AnimatedNumber
                          value={holding.peRatio}
                          format="decimal"
                          decimals={2}
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      <EarningsCell
                        holding={holding}
                        isLoading={isLoading}
                        hasPreviousData={hasPrevious}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
