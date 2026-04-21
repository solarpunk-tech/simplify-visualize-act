import { SiteCtaBand, SiteFaq, SiteFeatureGrid, SiteHero, SitePricingGrid, SiteTrustBar } from "@/components/marketing/SiteSections";

export default function SiteHome() {
  return (
    <div>
      <SiteHero />
      <SiteTrustBar />
      <SiteFeatureGrid />
      <SitePricingGrid />
      <SiteFaq />
      <SiteCtaBand />
    </div>
  );
}