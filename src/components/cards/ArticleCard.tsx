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
      className="group block bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all"
    >
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

      {(excerpt || _formatted?.excerpt) && (
        <p className="mt-2 text-sm text-muted line-clamp-2">
          {_formatted?.excerpt ? (
            <span
              dangerouslySetInnerHTML={{ __html: _formatted.excerpt }}
              className="[&_mark]:bg-primary/20 [&_mark]:rounded-sm"
            />
          ) : (
            excerpt
          )}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2 text-xs text-muted">
        {authorName && (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {authorName}
          </span>
        )}
        {authorName && formattedDate && <span>·</span>}
        {formattedDate && <span>{formattedDate}</span>}
      </div>

      {tags && tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs bg-accent text-muted rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
