export const homeContent = {
  name: 'Akshay Borse',
  tagline: 'Designing systems that increase clarity and prevent silent failure.',
  roles: 'Software Engineer · System Thinker · Writer',
  heroDescription:
    'I design systems—both mental and technical—that reduce hidden failure and increase clarity.',
  ctas: [
    {
      id: 'writing',
      label: 'Explore Writing',
      href: '#pillar-thinking-loops',
    },
    {
      id: 'systems',
      label: 'Explore Systems',
      href: '#pillar-systems',
    },
  ],
  themes: ['Clarity', 'Systems', 'AI', 'Cognition', 'Reliability'],
  pillars: [
    {
      id: 'thinking-loops',
      anchorId: 'pillar-thinking-loops',
      title: 'Invisible Thinking Loops',
      description:
        'Exploring the hidden cognitive patterns that shape decisions, behavior, and life outcomes.',
      accent: 'violet' as const,
    },
    {
      id: 'systems',
      anchorId: 'pillar-systems',
      title: "Systems That Don't Fail Silently",
      description:
        'Designing engineering systems where AI and automation are guided by constraints, validation, and real-world tradeoffs.',
      accent: 'cyan' as const,
    },
  ],
  about:
    'Software engineer focused on building systems at the intersection of clarity, decision-making, and scalable technology.',
} as const
