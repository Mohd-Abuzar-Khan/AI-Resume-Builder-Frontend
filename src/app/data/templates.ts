export type TemplateCategory =
  | 'Minimal'
  | 'Creative'
  | 'Technical'
  | 'Executive'
  | 'Academic';

export type Template = {
  id: string;
  name: string;
  category: TemplateCategory;
  accent: string; // hsl
  tagline: string;
};

export const TEMPLATE_CATEGORIES: ('All' | TemplateCategory)[] = [
  'All',
  'Minimal',
  'Creative',
  'Technical',
  'Executive',
  'Academic',
];

export const templates: Template[] = [
  { id: 't1', name: 'Northwind', category: 'Minimal', accent: '184 30% 35%', tagline: 'Quiet, confident, classic.' },
  { id: 't2', name: 'Vellum', category: 'Minimal', accent: '30 25% 55%', tagline: 'Editorial whitespace.' },
  { id: 't3', name: 'Atlas', category: 'Executive', accent: '215 25% 25%', tagline: 'Boardroom-ready.' },
  { id: 't4', name: 'Helix', category: 'Technical', accent: '150 35% 30%', tagline: 'Dense, scannable, ATS-first.' },
  { id: 't5', name: 'Studio', category: 'Creative', accent: '340 50% 55%', tagline: 'Portfolio-forward.' },
  { id: 't6', name: 'Pixel', category: 'Creative', accent: '265 45% 55%', tagline: 'For designers & makers.' },
  { id: 't7', name: 'Compile', category: 'Technical', accent: '200 50% 35%', tagline: 'Built for engineers.' },
  { id: 't8', name: 'Lyceum', category: 'Academic', accent: '20 35% 35%', tagline: 'Publications-friendly.' },
  { id: 't9', name: 'Quartet', category: 'Executive', accent: '0 0% 15%', tagline: 'Four-column elegance.' },
  { id: 't10', name: 'Linen', category: 'Minimal', accent: '40 25% 55%', tagline: 'Soft, paper-like.' },
  { id: 't11', name: 'Beacon', category: 'Executive', accent: '210 40% 30%', tagline: 'Leadership narrative.' },
  { id: 't12', name: 'Folio', category: 'Academic', accent: '120 20% 30%', tagline: 'Citations & sections.' },
];
