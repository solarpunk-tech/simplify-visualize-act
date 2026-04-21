export const siteNav = [
  { label: "Home", href: "/site" },
  { label: "Features", href: "/site/features" },
  { label: "Pricing", href: "/site/pricing" },
  { label: "Contact", href: "/site/contact" },
];

export const featureHighlights = [
  {
    title: "Unified workspace",
    description: "Plan, prioritize, and execute across inbox, projects, tasks, and meetings in one consistent flow.",
  },
  {
    title: "Agent-ready operations",
    description: "Move faster with AI copilots and structured workflows designed around approvals and visibility.",
  },
  {
    title: "Design-system consistency",
    description: "A single visual language powered by shared tokens and shadcn primitives across product and website.",
  },
  {
    title: "Actionable intelligence",
    description: "Track outcomes with live operational snapshots, trend cards, and team-level execution metrics.",
  },
  {
    title: "Secure collaboration",
    description: "Built for role-based access, operational controls, and audit-friendly communication flows.",
  },
  {
    title: "Fast implementation",
    description: "Ship confidently with reusable components, predictable layouts, and production-ready defaults.",
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
    features: ["Everything in Growth", "SSO/SAML", "Custom onboarding", "Dedicated success lead"],
    cta: "Talk to Sales",
    featured: false,
  },
];

export const faqs = [
  {
    question: "Can we keep using our current tools?",
    answer: "Yes. Start with one workflow and layer integrations over time. The system is designed to coexist during rollout.",
  },
  {
    question: "Is this built on the same UI system as the product?",
    answer: "Yes. This website uses the same tokens, typography, and component primitives as the core app experience.",
  },
  {
    question: "Do you support custom onboarding?",
    answer: "Growth and Enterprise plans include guided onboarding, templates, and rollout support for your team.",
  },
];

export const trustLogos = ["Northline Capital", "Vantage Ops", "Aster Labs", "Cobalt Group", "Veridian"];