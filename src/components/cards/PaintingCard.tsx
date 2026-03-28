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
  year,
  images,
  _formatted,
}: PaintingCardProps) {
  const thumbnail = images && images.length > 0 ? images[0] : null;

  return (
    <Link
      href={`/paintings/${slug}`}
      className="group block rounded-xl overflow-hidden bg-card hover:shadow-lg transition-all duration-200"
    >
      {/* Image — Google Images style square thumbnail */}
      <div className="aspect-square bg-accent overflow-hidden relative">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-warm-light to-accent">
            <svg className="w-10 h-10 text-warm/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="px-2 py-2">
        <h3 className="text-xs font-medium text-foreground truncate leading-snug">
          {_formatted?.title ? (
            <span
              dangerouslySetInnerHTML={{ __html: _formatted.title }}
              className="[&_mark]:bg-warm/20 [&_mark]:rounded-sm"
            />
          ) : (
            title
          )}
        </h3>
        <div className="text-[11px] text-muted truncate">
          {artistName}{year ? ` · ${year}` : ""}
        </div>
      </div>
    </Link>
  );
}
