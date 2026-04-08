import type { Lang } from '../i18n/ui';

interface Trip {
  title: string;
  description: string;
  distance: string;
  category: string;
  order: number;
  image?: string;
}

export async function getTrips(lang: Lang): Promise<Trip[]> {
  const files = lang === 'cs'
    ? import.meta.glob('../content/trips/cs/*.md', { eager: true })
    : import.meta.glob('../content/trips/en/*.md', { eager: true });

  const trips: Trip[] = Object.values(files).map((file: any) => ({
    title: file.frontmatter.title,
    description: file.frontmatter.description,
    distance: file.frontmatter.distance,
    category: file.frontmatter.category,
    order: file.frontmatter.order ?? 99,
    image: file.frontmatter.image,
  }));

  return trips.sort((a, b) => a.order - b.order);
}
