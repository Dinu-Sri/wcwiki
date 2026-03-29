import Link from "next/link";

interface ArticleCardProps {
  slug: string;
  title: string;
  excerpt?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _formatted?: Record<string, any>;
}

export function ArticleCard({
  slug,
  title,
  excerpt,
  _formatted,
}: ArticleCardProps) {
  const displayTitle = _formatted?.title || title;
  const displayExcerpt = _formatted?.excerpt || _formatted?.content || excerpt;
  return (
    <Link
      href={`/articles/${slug}`}
      className="group block px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl hover:bg-card hover:shadow-sm transition-all duration-200"
    >
      {/* URL-style breadcrumb */}
      <div className="text-[11px] sm:text-xs text-primary mb-0.5 truncate">
        wcwiki.com › articles › {slug}
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-medium text-primary group-hover:underline leading-snug" dangerouslySetInnerHTML={{ __html: displayTitle }} />

      {/* Excerpt */}
      {displayExcerpt && (
        <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: displayExcerpt }} />
      )}
    </Link>
  );
}
