export type Tier = {
  id: string;
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  cta: string;
  highlight?: boolean;
  features: string[];
};

export const tiers: Tier[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    tagline: 'Get a polished resume out the door.',
    cta: 'Start free',
    features: [
      '3 resume creations / month',
      '5 AI calls / month',
      'Basic ATS check',
      'PDF export',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$12',
    cadence: 'per month',
    tagline: 'For serious job seekers tailoring fast.',
    cta: 'Go Pro',
    highlight: true,
    features: [
      'Unlimited resumes & versions',
      'Unlimited AI tailoring',
      'Advanced ATS scoring',
      'Cover letter generator',
      'Priority export (PDF · DOCX · TXT)',
      'Remove Resumade footer',
    ],
  },
  {
    id: 'teams',
    name: 'Teams',
    price: '$29',
    cadence: 'per seat / month',
    tagline: 'For coaches, bootcamps & career services.',
    cta: 'Contact sales',
    features: [
      'Everything in Pro',
      'Shared template library',
      'Reviewer comments',
      'Brand controls',
      'SSO & audit logs',
    ],
  },
];

export const faqs = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes — Pro is month-to-month. You\'ll keep access until the end of your billing period.',
  },
  {
    q: 'Do you offer student discounts?',
    a: 'We offer 50% off Pro for verified students. Email us with your .edu address after signing up.',
  },
  {
    q: 'Will my resume pass ATS systems?',
    a: 'Every template is structured to be parsed cleanly by major ATS. Pro adds a per-job ATS score.',
  },
  {
    q: 'What does \'AI tailoring\' actually do?',
    a: 'Paste a job description and Resumade rewrites your bullets, reorders sections, and surfaces the most relevant projects.',
  },
];
