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
      className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-primary/30 transition-all"
    >
      {/* Image or placeholder */}
      <div className="aspect-[4/3] bg-accent overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {_formatted?.title ? (
            <span
              dangerouslySetInnerHTML={{ __html: _formatted.title }}
              className="[&_mark]:bg-primary/20 [&_mark]:rounded-sm"
            />
          ) : (
            title
          )}
        </h3>
        <div className="mt-1 text-sm text-muted">
          {artistName && <span>{artistName}</span>}
          {artistName && year && <span> · </span>}
          {year && <span>{year}</span>}
        </div>
        {medium && (
          <span className="mt-2 inline-block px-2 py-0.5 text-xs bg-accent text-muted rounded-full">
            {medium}
          </span>
        )}
      </div>

      {/* Attribution */}
      <div className="px-4 pb-3">
        <p className="text-[10px] text-muted/60 italic">
          For educational purposes only
        </p>
      </div>
    </Link>
  );
}
