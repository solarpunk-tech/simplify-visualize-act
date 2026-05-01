import {
  SiteCtaBand,
  SiteFeatures,
  SiteHero,
  SiteHowItWorks,
  SiteOutcomes,
  SiteProblem,
  SiteSocialProof,
  SiteSolution,
  SiteTrustBar,
  SiteUseCases,
  SiteVisualProof,
} from "@/components/marketing/SiteSections";

export default function SiteHome() {
  return (
    <div>
      <SiteHero />
      <SiteTrustBar />
      <SiteProblem />
      <SiteSolution />
      <SiteFeatures />
      <SiteHowItWorks />
      <SiteVisualProof />
      <SiteUseCases />
      <SiteOutcomes />
      <SiteSocialProof />
      <SiteCtaBand />
    </div>
  );
}
