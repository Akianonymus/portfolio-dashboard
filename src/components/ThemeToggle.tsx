"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const themeOptions = [
  {
    value: "light",
    icon: <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />,
    label: "Light",
  },
  {
    value: "dark",
    icon: <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />,
    label: "Dark",
  },
  {
    value: "system",
    icon: <Laptop className="h-[1.2rem] w-[1.2rem] transition-all" />,
    label: "System",
  },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Default to system theme during SSR
  const currentTheme = mounted ? theme : "system";

  const currentThemeOption =
    themeOptions.find((opt) => opt.value === currentTheme) || themeOptions[2];

  const toggleTheme = () => {
    const currentIdx = themeOptions.findIndex(
      (opt) => opt.value === currentTheme
    );
    const nextIdx = (currentIdx + 1) % themeOptions.length;
    setTheme(themeOptions[nextIdx].value);
  };

  return (
    <Button
      className="cursor-pointer"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch theme (current: ${currentThemeOption.label})`}
      suppressHydrationWarning
    >
      {currentThemeOption.icon}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
