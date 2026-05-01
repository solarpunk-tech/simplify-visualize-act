import { SiteCtaBand, SitePricingGrid } from "@/components/marketing/SiteSections";
import { marketingSectionInner } from "@/lib/marketing-content";
import { cn } from "@/lib/utils";

export default function SitePricing() {
  return (
    <div>
      <section className={cn("space-y-4 border border-border/60 bg-card py-10 md:py-14", marketingSectionInner)}>
        <p className="section-label">Pricing</p>
        <h1 className="font-heading text-4xl tracking-tight">Simple plans for every stage of scale</h1>
        <p className="max-w-3xl text-muted-foreground">
          Start small, expand confidently, and keep the same design and operating model as you grow.
        </p>
      </section>
      <SitePricingGrid />
      <SiteCtaBand />
    </div>
  );
}