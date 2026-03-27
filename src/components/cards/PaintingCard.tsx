import Link from "next/link";

interface PaintingCardProps {
  slug: string;
  title: string;
  artistName?: string;
  medium?: string | null;
  year?: number | null;
  images?: string[];
  _formatted?: {
    title?: string;
    description?: string;
  };
}

export function PaintingCard({
  slug,
  title,
  artistName,
  medium,
  year,
  images,
  _formatted,
}: PaintingCardProps) {
  const thumbnail = images && images.length > 0 ? images[0] : null;

  return (
    <Link
      href={`/paintings/${slug}`}
      className="group block bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-[var(--shadow)] hover:border-warm/20 hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Image or placeholder */}
      <div className="aspect-[4/3] bg-accent overflow-hidden relative">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-warm-light to-accent">
            <svg className="w-12 h-12 text-warm/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 leading-snug">
          {_formatted?.title ? (
            <span
              dangerouslySetInnerHTML={{ __html: _formatted.title }}
              className="[&_mark]:bg-warm/20 [&_mark]:rounded-sm"
            />
          ) : (
            title
          )}
        </h3>
        <div className="mt-1.5 text-sm text-muted flex items-center gap-1.5">
          {artistName && <span>{artistName}</span>}
          {artistName && year && <span className="text-border">·</span>}
          {year && <span className="tabular-nums">{year}</span>}
        </div>
        {medium && (
          <span className="mt-3 inline-block px-2.5 py-0.5 text-[11px] bg-warm-light text-warm rounded-full font-medium">
            {medium}
          </span>
        )}
      </div>
    </Link>
  );
}
