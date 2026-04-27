/** Horizontal rhythm for marketing pages: full-bleed sections wrap content in this. */
export const marketingSectionInner =
  "mx-auto w-full max-w-7xl px-6 md:px-10";

export const siteNav = [
  { label: "Home", href: "/site" },
  { label: "Features", href: "/site/features" },
  { label: "Pricing", href: "/site/pricing" },
  { label: "Contact", href: "/site/contact" },
];

export const featureHighlights = [
  {
    title: "Unified workspace",
    description:
      "Plan, prioritize, and execute across inbox, projects, tasks, and meetings in one consistent flow. No context switching. No missing threads.",
  },
  {
    title: "Agent-ready operations",
    description:
      "Move faster with AI that identifies what's a decision, what's a task, and what needs approval — without you having to sort through noise.",
  },
  {
    title: "Design-system consistency",
    description:
      "A single visual language powered by shared tokens and shadcn primitives — across your product and your marketing site.",
  },
  {
    title: "Actionable intelligence",
    description:
      "Highlights risks before they escalate. Nudges decisions that are pending. Surfaces hidden blockers across your entire operation.",
  },
  {
    title: "Secure collaboration",
    description:
      "Role-based access, audit-friendly communication flows, and operational controls designed for teams that cannot afford a gap.",
  },
  {
    title: "Fast implementation",
    description:
      "Most teams are live within a week. Reusable components, predictable layouts, and production-ready defaults out of the box.",
  },
];

export const pricingTiers = [
  {
    name: "Starter",
    price: "$29",
    cadence: "per seat / month",
    description: "For small teams getting operational workflows organized.",
    features: ["Projects + Tasks", "Team inbox", "Standard analytics", "Email support"],
    cta: "Start Starter",
    featured: false,
  },
  {
    name: "Growth",
    price: "$79",
    cadence: "per seat / month",
    description: "For scaling teams that need approvals, automation, and speed.",
    features: ["Everything in Starter", "Approvals + Workflows", "Agent workbench", "Priority support"],
    cta: "Start Growth",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "annual contract",
    description: "For larger organizations with governance and advanced controls.",
    features: ["Everything in Growth", "SSO / SAML", "Custom onboarding", "Dedicated success lead"],
    cta: "Talk to Sales",
    featured: false,
  },
];

export const faqs = [
  {
    question: "Can we keep using our current tools?",
    answer:
      "Yes. Start with one workflow and layer integrations over time. Ubik is designed to coexist during rollout — no big-bang migration required.",
  },
  {
    question: "How long does implementation take?",
    answer:
      "Most teams are up and running within a week. Complex enterprise rollouts with custom integrations typically take two to four weeks. We stay involved until your workflows are live.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes — 14 days, no credit card required. Every plan starts with a full-featured trial so you can validate fit before committing.",
  },
  {
    question: "What tools does Ubik connect to?",
    answer:
      "Gmail, Google Calendar, Drive, Slack, and major ERP/CRM systems. We add new integrations based on early access partner needs.",
  },
  {
    question: "Do you support custom onboarding?",
    answer:
      "Growth and Enterprise plans include guided onboarding, templates, and rollout support. Early access teams get white-glove setup from our team.",
  },
];

export const trustLogos = [
  "Northline Capital",
  "Vantage Ops",
  "Aster Labs",
  "Cobalt Group",
  "Veridian",
];
