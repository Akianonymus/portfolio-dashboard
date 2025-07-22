import { useState } from "react";
import { PortfolioHolding } from "@/types/portfolio";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  | "peRatio";
type SortDirection = "asc" | "desc";

export const PortfolioTable = ({
  holdings,
  isUpdating,
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
                <TableHead>Exchange</TableHead> {/* Exchange is not sortable */}
                <SortableHeader field="currentPrice">CMP</SortableHeader>
                <SortableHeader field="presentValue">
                  Present Value
                </SortableHeader>
                <SortableHeader field="gainLoss">Gain/Loss</SortableHeader>
                <SortableHeader field="peRatio">P/E Ratio</SortableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHoldings.map((holding) => {
                const isGain = holding.gainLoss >= 0;

                return (
                  <TableRow
                    key={holding.id}
                    className="border-border hover:bg-muted/50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {holding.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {holding.symbol}
                        </span>
                        <Badge variant="outline" className="w-fit mt-1 text-xs">
                          {holding.sector}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {formatCurrency(holding.purchasePrice)}
                    </TableCell>

                    <TableCell className="text-foreground font-medium">
                      {holding.quantity}
                    </TableCell>

                    <TableCell className="text-foreground font-medium">
                      {formatCurrency(holding.investment)}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {holding.portfolioPercentage.toFixed(1)}%
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {holding.exchange}
                      </Badge>
                    </TableCell>

                    <TableCell
                      className={cn("font-medium transition-all duration-300")}
                    >
                      <div className="flex items-center gap-1">
                        {isGain ? (
                          <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                        )}
                        {formatCurrency(holding.currentPrice)}
                      </div>
                    </TableCell>

                    <TableCell
                      className={cn("font-medium transition-all duration-300")}
                    >
                      {formatCurrency(holding.presentValue)}
                    </TableCell>

                    <TableCell
                      className={cn(
                        "font-bold transition-all duration-300",
                        isGain
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      )}
                    >
                      <div className="flex flex-col">
                        <span>{formatCurrency(holding.gainLoss)}</span>
                        <span className="text-xs">
                          ({formatPercentage(holding.gainLossPercentage)})
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {holding.peRatio}
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
