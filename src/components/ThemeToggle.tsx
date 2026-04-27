import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      size="icon-sm"
      className="rounded-none border-border/70 bg-background hover:bg-secondary"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {dark ? <SunIcon className="h-3.5 w-3.5" /> : <MoonIcon className="h-3.5 w-3.5" />}
    </Button>
  );
}
