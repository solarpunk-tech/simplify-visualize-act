import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { siteNav } from "@/lib/marketing-content";
import { cn } from "@/lib/utils";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="size-8" />;
  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="flex size-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
    >
      {resolvedTheme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
    </button>
  );
}

export function MarketingLayout() {
  useEffect(() => {
    const prev = {
      html: document.documentElement.style.overflow,
      body: document.body.style.overflow,
    };
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
    return () => {
      document.documentElement.style.overflow = prev.html;
      document.body.style.overflow = prev.body;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* Swiss accent top rule */}
      <div className="h-1 w-full bg-primary" />

      <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          {/* Wordmark */}
          <NavLink to="/site" className="group flex items-center gap-3">
            <div className="flex h-8 items-center justify-center bg-primary px-2">
              <span className="font-mono text-[10px] font-bold tracking-tight text-white">[.ubik]</span>
            </div>
            <span className="hidden text-xs font-bold uppercase tracking-[0.2em] text-foreground md:block">
              ubik
            </span>
          </NavLink>

          {/* Nav */}
          <nav className="hidden items-center gap-0 md:flex">
            {siteNav.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/site"}
                className={({ isActive }) =>
                  cn(
                    "border-r border-foreground/15 px-5 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              asChild
              size="sm"
              className="rounded-none bg-foreground px-5 text-xs font-bold uppercase tracking-widest text-background hover:bg-primary hover:text-white"
            >
              <NavLink to="/chat">Open App →</NavLink>
            </Button>
          </div>
        </div>
      </header>

      <main className="w-full">
        <Outlet />
      </main>

      <footer className="mt-20 border-t-4 border-foreground bg-zinc-950 text-white dark:bg-zinc-900">
        <div className="mx-auto w-full max-w-7xl px-6 py-12 md:px-10">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 items-center justify-center bg-primary px-2.5">
                  <span className="font-mono text-xs font-bold tracking-tight text-white">[.ubik]</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                  ubik
                </span>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-white/60">
                One screen. All operations. No chaos.
              </p>
            </div>

            <div>
              <p className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-white/40">Pages</p>
              <div className="space-y-2">
                {siteNav.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className="block text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-white/40">Contact</p>
              <div className="space-y-2 text-sm text-white/70">
                <p>hello@ubik.design</p>
                <p>+1 (555) 281-1034</p>
                <p>Mon–Fri, 9am–6pm PT</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-white/30">
            <p className="font-mono">© 2026 ubik</p>
            <p className="font-mono font-bold uppercase tracking-widest">Early Access · Curated Teams Only</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
