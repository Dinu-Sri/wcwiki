import Link from "next/link";

interface ArtistCardProps {
  slug: string;
  name: string;
  nationality?: string | null;
  birthYear?: number | null;
  deathYear?: number | null;
  image?: string | null;
  styles?: string[];
  _formatted?: {
    name?: string;
    nationality?: string;
    bio?: string;
  };
}

export function ArtistCard({
  slug,
  name,
  nationality,
  birthYear,
  deathYear,
  image,
  styles,
  _formatted,
}: ArtistCardProps) {
  const lifespan =
    birthYear && deathYear
      ? `${birthYear}–${deathYear}`
      : birthYear
        ? `b. ${birthYear}`
        : null;

  return (
    <Link
      href={`/artists/${slug}`}
      className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-primary/30 transition-all"
    >
      {/* Image or placeholder */}
      <div className="aspect-[4/3] bg-accent overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {_formatted?.name ? (
            <span
              dangerouslySetInnerHTML={{ __html: _formatted.name }}
              className="[&_mark]:bg-primary/20 [&_mark]:rounded-sm"
            />
          ) : (
            name
          )}
        </h3>
        <div className="mt-1 text-sm text-muted">
          {nationality && <span>{nationality}</span>}
          {nationality && lifespan && <span> · </span>}
          {lifespan && <span>{lifespan}</span>}
        </div>
        {styles && styles.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {styles.slice(0, 3).map((style) => (
              <span
                key={style}
                className="px-2 py-0.5 text-xs bg-accent text-muted rounded-full"
              >
                {style}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
