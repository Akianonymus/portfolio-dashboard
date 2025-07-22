import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number, toWords: boolean = false) => {
  if (toWords) {
    // Simple conversion for INR (crore, lakh, thousand, etc.)
    const absAmount = Math.abs(amount);
    let words = "";
    if (absAmount >= 1_00_00_000) {
      words = (amount / 1_00_00_000).toFixed(2) + " cr";
    } else if (absAmount >= 1_00_000) {
      words = (amount / 1_00_000).toFixed(2) + " lakh";
    } else if (absAmount >= 1_000) {
      words = (amount / 1_000).toFixed(2) + " th";
    } else {
      words = amount.toString();
    }
    return (amount < 0 ? "-₹" : "₹") + words;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercentage = (percent: number) => {
  return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`;
};
