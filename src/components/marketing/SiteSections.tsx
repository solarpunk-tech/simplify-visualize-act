import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { faqs, featureHighlights, pricingTiers, trustLogos } from "@/lib/marketing-content";

export function SiteHero() {
  return (
    <section className="space-y-6 border border-border/60 bg-card px-6 py-10 md:px-10 md:py-16">
      <Badge variant="secondary" className="w-fit">
        Unified execution platform
      </Badge>
      <div className="max-w-3xl space-y-4">
        <h1 className="font-heading text-4xl leading-tight tracking-tight md:text-5xl">
          Build faster operations with one coherent workflow system.
        </h1>
        <p className="text-lg text-muted-foreground">
          Simplify, visualize, and act across your entire team with the same opinionated design system used by the core
          product experience.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild size="lg">
          <Link to="/site/pricing">
            Start now <ArrowRight className="ml-1 size-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/site/features">Explore features</Link>
        </Button>
      </div>
    </section>
  );
}

export function SiteTrustBar() {
  return (
    <section className="space-y-3 border-x border-b border-border/60 bg-muted/30 px-6 py-6 md:px-10">
      <p className="section-label">Trusted by execution-focused teams</p>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
        {trustLogos.map((name) => (
          <div key={name} className="surface-well px-3 py-2 text-sm font-medium">
            {name}
          </div>
        ))}
      </div>
    </section>
  );
}

export function SiteFeatureGrid() {
  return (
    <section className="space-y-6 py-10 md:py-14">
      <div className="space-y-2">
        <p className="section-label">Features</p>
        <h2 className="font-heading text-3xl tracking-tight">Built for modern operating teams</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {featureHighlights.map((feature) => (
          <Card key={feature.title} className="surface-card rounded-none border-border/70">
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function SitePricingGrid() {
  return (
    <section className="space-y-6 py-10 md:py-14">
      <div className="space-y-2">
        <p className="section-label">Pricing</p>
        <h2 className="font-heading text-3xl tracking-tight">Choose a plan that scales with your team</h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {pricingTiers.map((tier) => (
          <Card
            key={tier.name}
            className={`rounded-none border-border/70 ${tier.featured ? "surface-active ring-1 ring-primary/15" : "surface-card"}`}
          >
            <CardHeader className="space-y-2">
              <CardTitle>{tier.name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
              <div className="pt-2">
                <p className="font-heading text-3xl">{tier.price}</p>
                <p className="text-sm text-muted-foreground">{tier.cadence}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {tier.features.map((feature) => (
                  <li key={feature}>- {feature}</li>
                ))}
              </ul>
              <Button className="w-full" variant={tier.featured ? "default" : "outline"}>
                {tier.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function SiteFaq() {
  return (
    <section className="space-y-6 py-10 md:py-14">
      <div className="space-y-2">
        <p className="section-label">FAQ</p>
        <h2 className="font-heading text-3xl tracking-tight">Answers before rollout</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {faqs.map((faq) => (
          <Card key={faq.question} className="surface-card rounded-none border-border/70">
            <CardHeader>
              <CardTitle className="text-base">{faq.question}</CardTitle>
              <CardDescription>{faq.answer}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function SiteCtaBand() {
  return (
    <section className="surface-active mt-4 flex flex-col gap-4 border border-border/70 px-6 py-8 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="font-heading text-2xl tracking-tight">Ready to launch your unified workspace?</p>
        <p className="mt-1 text-sm text-muted-foreground">Start with the same UI system your product team already uses.</p>
      </div>
      <Button asChild size="lg">
        <Link to="/site/contact">Book a walkthrough</Link>
      </Button>
    </section>
  );
}