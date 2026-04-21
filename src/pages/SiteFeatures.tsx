import { SiteCtaBand, SiteFeatureGrid, SiteTrustBar } from "@/components/marketing/SiteSections";

export default function SiteFeatures() {
  return (
    <div>
      <section className="space-y-4 border border-border/60 bg-card px-6 py-10 md:px-10 md:py-14">
        <p className="section-label">Feature deep dive</p>
        <h1 className="font-heading text-4xl tracking-tight">Everything your team needs to move from planning to execution</h1>
        <p className="max-w-3xl text-muted-foreground">
          Unified UI patterns, predictable workflows, and operational visibility designed for high-trust collaboration.
        </p>
      </section>
      <SiteTrustBar />
      <SiteFeatureGrid />
      <SiteCtaBand />
    </div>
  );
}