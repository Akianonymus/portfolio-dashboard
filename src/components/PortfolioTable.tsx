"use client";

import { useState } from "react";
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

interface PortfolioTableProps {
  holdings: PortfolioHolding[];
  isUpdating: boolean;
  isDynamicDataLoading?: boolean;
  hasDynamicData?: boolean;
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

export const PortfolioTable = ({
  holdings,
  isUpdating,
  isDynamicDataLoading = false,
  hasDynamicData = false,
}: PortfolioTableProps) => {
  const [sortField, setSortField] = useState<SortField>("presentValue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedHoldings = [...holdings].sort((a, b) => {
    // if sorting by "latestEarnings", compare by amount
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

  const SortableHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(field)}
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

  const renderSkeleton = (width: string = "w-16") => (
    <Skeleton className={cn("h-4", width)} />
  );

  const hasDynamicDataForHolding = (holding: PortfolioHolding) => {
    return hasDynamicData && holding.currentPrice > 0;
  };

  return (
    <Card className="bg-card border-border shadow-card w-full">
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <SortableHeader field="name">Stock</SortableHeader>
                <SortableHeader field="purchasePrice">
                  Purchase Price
                </SortableHeader>
                <SortableHeader field="quantity">Qty</SortableHeader>
                <SortableHeader field="investment">Investment</SortableHeader>
                <SortableHeader field="portfolioPercentage">
                  Portfolio %
                </SortableHeader>
                <TableHead>Exchange</TableHead>
                <SortableHeader field="currentPrice">CMP</SortableHeader>
                <SortableHeader field="presentValue">
                  Present Value
                </SortableHeader>
                <SortableHeader field="gainLoss">Gain/Loss</SortableHeader>
                <SortableHeader field="peRatio">P/E Ratio</SortableHeader>
                <SortableHeader field="latestEarnings">
                  Latest Earnings
                </SortableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHoldings.map((holding) => {
                const isGain = holding.gainLoss >= 0;
                const hasDynamic = hasDynamicDataForHolding(holding);

                return (
                  <TableRow
                    key={holding.id}
                    className="border-border hover:bg-muted/50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="font-medium text-foreground">
                          {holding.name}
                        </div>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="w-fit text-xs">
                            {holding.symbol || holding.name}
                          </Badge>
                          <Badge variant="secondary" className="w-fit text-xs">
                            {holding.sector}
                          </Badge>
                        </div>
                      </div>
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
                      {isDynamicDataLoading && !hasDynamic ? (
                        renderSkeleton("w-12")
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

                    <TableCell
                      className={cn("font-medium transition-all duration-300")}
                    >
                      {isDynamicDataLoading && !hasDynamic ? (
                        renderSkeleton("w-16")
                      ) : (
                        <div className="flex items-center gap-1">
                          {hasDynamic &&
                            (isGain ? (
                              <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                            ))}
                          <AnimatedNumber
                            value={holding.currentPrice}
                            format="currency"
                          />
                        </div>
                      )}
                    </TableCell>

                    <TableCell
                      className={cn("font-medium transition-all duration-300")}
                    >
                      {isDynamicDataLoading && !hasDynamic ? (
                        renderSkeleton("w-20")
                      ) : (
                        <AnimatedNumber
                          value={holding.presentValue}
                          format="currency"
                        />
                      )}
                    </TableCell>

                    <TableCell
                      className={cn(
                        "font-bold transition-all duration-300",
                        hasDynamic && isGain
                          ? "text-green-600 dark:text-green-400"
                          : hasDynamic
                          ? "text-red-600 dark:text-red-400"
                          : ""
                      )}
                    >
                      {isDynamicDataLoading && !hasDynamic ? (
                        <div className="flex flex-col gap-1">
                          {renderSkeleton("w-16")}
                          {renderSkeleton("w-12")}
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span>
                            <AnimatedNumber
                              value={holding.gainLoss}
                              format="currency"
                            />
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
                      )}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {isDynamicDataLoading && !hasDynamic ? (
                        renderSkeleton("w-12")
                      ) : (
                        <AnimatedNumber
                          value={holding.peRatio}
                          format="decimal"
                          decimals={2}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {isDynamicDataLoading && !hasDynamic ? (
                        <div className="flex flex-col gap-1">
                          {renderSkeleton("w-8")}
                          {renderSkeleton("w-12")}
                        </div>
                      ) : (
                        holding.latestEarnings &&
                        holding.latestEarnings.period &&
                        typeof holding.latestEarnings.amount === "number" &&
                        holding.latestEarnings.amount !== 0 && (
                          <div className="flex flex-col">
                            <div className="text-xs">
                              {holding.latestEarnings.period}
                            </div>
                            <div className="text-sm">
                              {holding.latestEarnings.type === "total" ? (
                                <AnimatedNumber
                                  value={holding.latestEarnings.amount}
                                  format="currency"
                                />
                              ) : (
                                <AnimatedNumber
                                  value={holding.latestEarnings.amount}
                                  format="decimal"
                                  decimals={2}
                                />
                              )}
                            </div>
                          </div>
                        )
                      )}
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
