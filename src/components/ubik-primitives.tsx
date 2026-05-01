import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Surface({
  className,
  size = "default",
  children,
}: {
  className?: string;
  size?: "default" | "sm";
  children: React.ReactNode;
}) {
  return (
    <Card size={size} className={cn("surface-card", className)}>
      {children}
    </Card>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="section-label text-[11px] tracking-[0.18em]">{eyebrow}</p>
        ) : null}
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function StatusPill({
  tone = "default",
  children,
}: {
  tone?: "default" | "alert" | "success" | "muted";
  children: React.ReactNode;
}) {
  const toneProps = {
    default: {
      variant: "secondary" as const,
      className: "bg-secondary text-secondary-foreground",
    },
    alert: {
      variant: "outline" as const,
      className: "support-chip",
    },
    success: {
      variant: "outline" as const,
      className: "border-primary/25 bg-primary/5 text-primary",
    },
    muted: {
      variant: "secondary" as const,
      className: "bg-secondary/70 text-muted-foreground",
    },
  }[tone];

  return (
    <Badge
      variant={toneProps.variant}
      className={cn("px-2.5 py-1 text-[11px] font-medium shadow-none", toneProps.className)}
    >
      {children}
    </Badge>
  );
}

export function SmallButton({
  children,
  className,
  active,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      className={cn(
        "text-xs font-medium shadow-none",
        active ? "bg-primary text-primary-foreground" : "border-border/70 bg-background hover:bg-secondary",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

export function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "alert";
}) {
  return (
    <div className="surface-card rounded-xl px-4 py-3">
      <p className="section-label text-[10px] tracking-[0.16em]">{label}</p>
      <p className={cn("mt-2 text-2xl font-semibold tracking-tight", tone === "alert" ? "text-primary" : "text-foreground")}>{value}</p>
    </div>
  );
}
