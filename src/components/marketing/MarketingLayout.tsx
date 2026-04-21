import { useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { siteNav } from "@/lib/marketing-content";
import { cn } from "@/lib/utils";

export function MarketingLayout() {
  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <NavLink to="/site" className="font-heading text-base tracking-tight">
            Simplify Visualize Act
          </NavLink>
          <nav className="hidden items-center gap-1 md:flex">
            {siteNav.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                    isActive && "bg-muted text-foreground"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Button asChild size="sm">
            <NavLink to="/chat">Open App</NavLink>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10 md:py-14">
        <Outlet />
      </main>

      <footer className="border-t border-border/70 bg-muted/35">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>Built with the same design system as the Simplify Visualize Act app.</p>
          <div className="flex items-center gap-4">
            <NavLink to="/site/features" className="hover:text-foreground">
              Features
            </NavLink>
            <NavLink to="/site/pricing" className="hover:text-foreground">
              Pricing
            </NavLink>
            <NavLink to="/site/contact" className="hover:text-foreground">
              Contact
            </NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}