import { FunnelSimpleIcon } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProjectDecisionTraceItem } from "@/lib/project-types";

export function DecisionTrace({ items }: { items: ProjectDecisionTraceItem[] }) {
  return (
    <section className="border border-border/70 bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <div>
          <p className="section-label">Decision trace</p>
          <p className="mt-1 text-sm text-muted-foreground">Latest source-grounded actions and decisions.</p>
        </div>
        <Button size="sm" variant="outline" type="button">
          <FunnelSimpleIcon data-icon="inline-start" /> Latest 5 actions
        </Button>
      </div>
      <div className="divide-y divide-border/60">
        {items.slice(0, 5).map((item) => (
          <div key={item.id} className="grid gap-3 px-4 py-3 md:grid-cols-[132px_minmax(0,1fr)_auto] md:items-center">
            <Badge variant="outline" className="w-fit bg-background px-2.5 py-1 text-[11px]">
              {item.source}
            </Badge>
            <p className="text-sm leading-6 text-foreground">{item.copy}</p>
            <span className="text-xs text-muted-foreground">{item.timestamp}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
