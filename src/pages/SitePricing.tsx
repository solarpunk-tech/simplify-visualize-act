import { SiteCtaBand, SitePricingGrid } from "@/components/marketing/SiteSections";

export default function SitePricing() {
  return (
    <div>
      <section className="space-y-4 border border-border/60 bg-card px-6 py-10 md:px-10 md:py-14">
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