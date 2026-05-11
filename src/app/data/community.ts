export type CommunityResume = {
  id: string;
  name: string;
  initials: string;
  role: string;
  template: string;
  likes: number;
  views: number;
  accent: string;
};

const ROLES = [
  'Senior Product Designer',
  'Staff Software Engineer',
  'Marketing Manager',
  'Data Scientist',
  'Product Manager',
  'UX Researcher',
  'Frontend Engineer',
  'DevOps Engineer',
  'Brand Strategist',
  'Content Lead',
  'iOS Engineer',
  'Growth Analyst',
];

const NAMES = [
  ['Maya', 'Patel'], ['Jordan', 'Lee'], ['Sofia', 'Reyes'], ['Liam', 'Chen'],
  ['Ava', 'Nguyen'], ['Noah', 'Brooks'], ['Zara', 'Khan'], ['Eli', 'Murphy'],
  ['Iris', 'Tanaka'], ['Omar', 'Haddad'], ['Nina', 'Kowalski'], ['Theo', 'Walsh'],
];

const TEMPLATES = ['Northwind', 'Atlas', 'Helix', 'Studio', 'Vellum', 'Pixel', 'Compile', 'Lyceum'];
const ACCENTS = ['184 30% 35%', '30 25% 55%', '215 25% 25%', '150 35% 30%', '340 45% 55%', '265 40% 50%'];

// Generate 5 pages × 12 = 60 community resumes
function generate(): CommunityResume[] {
  const out: CommunityResume[] = [];
  for (let i = 0; i < 60; i++) {
    const [first, last] = NAMES[i % NAMES.length];
    const role = ROLES[(i * 3) % ROLES.length];
    const template = TEMPLATES[i % TEMPLATES.length];
    const accent = ACCENTS[i % ACCENTS.length];
    out.push({
      id: `c${i + 1}`,
      name: `${first} ${last}`,
      initials: `${first[0]}${last[0]}`,
      role,
      template,
      likes: 40 + ((i * 37) % 900),
      views: 200 + ((i * 113) % 9800),
      accent,
    });
  }
  return out;
}

export const community: CommunityResume[] = generate();
export const PAGE_SIZE = 12;
