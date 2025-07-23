"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  format?: "currency" | "percentage" | "number" | "decimal";
  className?: string;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

const formatValue = (
  value: number,
  format: string,
  decimals: number = 2,
  prefix: string = "",
  suffix: string = ""
): string => {
  let formattedValue: string;

  switch (format) {
    case "currency":
      formattedValue = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
      break;
    case "percentage":
      formattedValue = `${value.toFixed(decimals)}%`;
      break;
    case "decimal":
      formattedValue = value.toFixed(decimals);
      break;
    case "number":
    default:
      formattedValue = new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
      break;
  }

  return `${prefix}${formattedValue}${suffix}`;
};

export const AnimatedNumber = ({
  value,
  format = "number",
  className,
  duration = 1000,
  decimals = 2,
  prefix = "",
  suffix = "",
}: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);
  const previousValueRef = useRef<number>(value);

  useEffect(() => {
    // Only animate if the value has changed
    if (previousValueRef.current === value) {
      setDisplayValue(value);
      return;
    }

    const startValue = previousValueRef.current;
    const endValue = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    // Update the previous value reference
    previousValueRef.current = value;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  const formattedDisplayValue = formatValue(
    displayValue,
    format,
    decimals,
    prefix,
    suffix
  );

  return (
    <span className={cn("transition-colors duration-200", className)}>
      {formattedDisplayValue}
    </span>
  );
};
