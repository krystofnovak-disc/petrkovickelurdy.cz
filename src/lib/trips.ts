import type { Lang } from '../i18n/ui';

interface Trip {
  title: string;
  description: string;
  distance: string;
  category: string;
  order: number;
  image?: string;
  mapUrl?: string;
}

export async function getTrips(lang: Lang): Promise<Trip[]> {
  const csFiles = import.meta.glob('../content/trips/cs/*.md', { eager: true });
  const enFiles = import.meta.glob('../content/trips/en/*.md', { eager: true });

  const files = lang === 'cs' ? csFiles : enFiles;

  const csImageBySlug = new Map<string, string>();
  for (const [path, file] of Object.entries(csFiles)) {
    const slug = path.split('/').pop()?.replace('.md', '') ?? '';
    const img = (file as any).frontmatter.image;
    if (img) csImageBySlug.set(slug, img);
  }

  const trips: Trip[] = Object.entries(files).map(([path, file]: [string, any]) => {
    const slug = path.split('/').pop()?.replace('.md', '') ?? '';
    return {
      title: file.frontmatter.title,
      description: file.frontmatter.description,
      distance: file.frontmatter.distance,
      category: file.frontmatter.category,
      order: file.frontmatter.order ?? 99,
      image: file.frontmatter.image || csImageBySlug.get(slug),
      mapUrl: file.frontmatter.mapUrl,
    };
  });

  return trips.sort((a, b) => a.order - b.order);
}
