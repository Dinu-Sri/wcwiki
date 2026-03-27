"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

interface SearchSuggestionsProps {
  results: {
    artists: AnyRecord[];
    paintings: AnyRecord[];
    articles: AnyRecord[];
    estimatedTotal: number;
  };
  activeIndex: number;
  onSelect: (result: AnyRecord) => void;
  onViewAll: () => void;
  query: string;
}

// Icons for each type
function ArtistIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function PaintingIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function ArticleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function HighlightedText({ html }: { html?: string }) {
  if (!html) return null;
  return (
    <span
      dangerouslySetInnerHTML={{ __html: html }}
      className="[&_mark]:bg-primary/20 [&_mark]:text-foreground [&_mark]:rounded-sm [&_mark]:px-0.5"
    />
  );
}

export function SearchSuggestions({
  results,
  activeIndex,
  onSelect,
  onViewAll,
  query,
}: SearchSuggestionsProps) {
  let runningIndex = 0;

  const hasResults =
    results.artists.length > 0 ||
    results.paintings.length > 0 ||
    results.articles.length > 0;

  if (!hasResults) {
    return (
      <div className="absolute z-50 w-full bg-card border border-border border-t-0 rounded-b-2xl shadow-lg overflow-hidden">
        <div className="px-4 py-6 text-center text-muted text-sm">
          No results found for &ldquo;{query}&rdquo;
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute z-50 w-full bg-card border border-border border-t-0 rounded-b-2xl shadow-lg overflow-hidden"
      role="listbox"
    >
      {/* Artists */}
      {results.artists.length > 0 && (
        <div>
          <div className="px-4 py-1.5 text-xs font-semibold text-muted uppercase tracking-wider bg-accent/50">
            Artists
          </div>
          {results.artists.map((artist, i) => {
            const idx = runningIndex++;
            return (
              <button
                key={artist.id || i}
                onClick={() => onSelect({ ...artist, _type: "artist" })}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  idx === activeIndex
                    ? "bg-primary/10 text-foreground"
                    : "hover:bg-accent"
                }`}
                role="option"
                aria-selected={idx === activeIndex}
              >
                <ArtistIcon />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">
                    <HighlightedText
                      html={
                        artist._formatted?.name || artist.name
                      }
                    />
                  </div>
                  {artist.nationality && (
                    <div className="text-xs text-muted truncate">
                      {artist.nationality}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Paintings */}
      {results.paintings.length > 0 && (
        <div>
          <div className="px-4 py-1.5 text-xs font-semibold text-muted uppercase tracking-wider bg-accent/50">
            Paintings
          </div>
          {results.paintings.map((painting, i) => {
            const idx = runningIndex++;
            return (
              <button
                key={painting.id || i}
                onClick={() => onSelect({ ...painting, _type: "painting" })}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  idx === activeIndex
                    ? "bg-primary/10 text-foreground"
                    : "hover:bg-accent"
                }`}
                role="option"
                aria-selected={idx === activeIndex}
              >
                <PaintingIcon />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">
                    <HighlightedText
                      html={
                        painting._formatted?.title || painting.title
                      }
                    />
                  </div>
                  <div className="text-xs text-muted truncate">
                    {painting.artistName}
                    {painting.medium ? ` · ${painting.medium}` : ""}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Articles */}
      {results.articles.length > 0 && (
        <div>
          <div className="px-4 py-1.5 text-xs font-semibold text-muted uppercase tracking-wider bg-accent/50">
            Articles
          </div>
          {results.articles.map((article, i) => {
            const idx = runningIndex++;
            return (
              <button
                key={article.id || i}
                onClick={() => onSelect({ ...article, _type: "article" })}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  idx === activeIndex
                    ? "bg-primary/10 text-foreground"
                    : "hover:bg-accent"
                }`}
                role="option"
                aria-selected={idx === activeIndex}
              >
                <ArticleIcon />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">
                    <HighlightedText
                      html={
                        article._formatted?.title || article.title
                      }
                    />
                  </div>
                  {article.excerpt && (
                    <div className="text-xs text-muted truncate">
                      {article.excerpt}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* View all results */}
      {results.estimatedTotal > 0 && (
        <button
          onClick={onViewAll}
          className="w-full px-4 py-2.5 text-sm text-primary font-medium text-center border-t border-border hover:bg-accent transition-colors"
        >
          View all {results.estimatedTotal} results →
        </button>
      )}
    </div>
  );
}
