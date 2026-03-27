import Link from "next/link";

interface ArticleCardProps {
  slug: string;
  title: string;
  excerpt?: string | null;
  authorName?: string;
  publishedAt?: string | null;
  tags?: string[];
  _formatted?: {
    title?: string;
    excerpt?: string;
  };
}

export function ArticleCard({
  slug,
  title,
  excerpt,
  authorName,
  publishedAt,
  tags,
  _formatted,
}: ArticleCardProps) {
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Link
      href={`/articles/${slug}`}
      className="group block bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:shadow-[var(--shadow)] hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
    >
      {/* Subtle accent line */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/40 via-warm/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

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

      {(excerpt || _formatted?.excerpt) && (
        <p className="mt-2.5 text-sm text-muted line-clamp-2 leading-relaxed">
          {_formatted?.excerpt ? (
            <span
              dangerouslySetInnerHTML={{ __html: _formatted.excerpt }}
              className="[&_mark]:bg-warm/20 [&_mark]:rounded-sm"
            />
          ) : (
            excerpt
          )}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3 text-xs text-muted">
        {authorName && (
          <span className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center">
              <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="font-medium">{authorName}</span>
          </span>
        )}
        {authorName && formattedDate && <span className="text-border">·</span>}
        {formattedDate && <span className="tabular-nums">{formattedDate}</span>}
      </div>

      {tags && tags.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 text-[11px] bg-accent text-muted rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
