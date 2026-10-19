"use client";

import * as React from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggleCircular } from "@/components/ui/theme-toggle-circular";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
] as const;

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const CurrentIcon = themes.find((t) => t.value === theme)?.icon ?? Laptop;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Change theme"
          id="theme-anchor"
        >
          {mounted ? <CurrentIcon /> : <Laptop />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {themes.map(({ value, label, icon: Icon }) => (
          <ThemeToggleCircular
            key={value}
            onToggle={() => setTheme(value)}
            theme={theme}
          >
            <DropdownMenuItem>
              <Icon className="mr-2" />
              {label}
            </DropdownMenuItem>
          </ThemeToggleCircular>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
