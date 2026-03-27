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
    <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
  );
}

function PaintingIcon() {
  return (
    <div className="w-8 h-8 rounded-lg bg-warm-light flex items-center justify-center shrink-0">
      <svg className="w-4 h-4 text-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );
}

function ArticleIcon() {
  return (
    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
      <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
  );
}

function HighlightedText({ html }: { html?: string }) {
  if (!html) return null;
  return (
    <span
      dangerouslySetInnerHTML={{ __html: html }}
      className="[&_mark]:bg-warm/20 [&_mark]:text-foreground [&_mark]:rounded-sm [&_mark]:px-0.5"
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
      <div className="absolute z-50 w-full glass border border-border border-t-0 rounded-b-2xl shadow-lg overflow-hidden">
        <div className="px-5 py-8 text-center">
          <svg className="w-10 h-10 mx-auto text-muted/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-muted text-sm">
            No results found for &ldquo;{query}&rdquo;
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute z-50 w-full glass border border-border border-t-0 rounded-b-2xl shadow-lg overflow-hidden"
      role="listbox"
    >
      {/* Artists */}
      {results.artists.length > 0 && (
        <div>
          <div className="px-4 py-2 text-[11px] font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
            <span className="w-4 h-px bg-primary/30"></span>
            Artists
          </div>
          {results.artists.map((artist, i) => {
            const idx = runningIndex++;
            return (
              <button
                key={artist.id || i}
                onClick={() => onSelect({ ...artist, _type: "artist" })}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 ${
                  idx === activeIndex
                    ? "bg-primary/8 border-l-2 border-l-primary"
                    : "hover:bg-accent/60 border-l-2 border-l-transparent"
                }`}
                role="option"
                aria-selected={idx === activeIndex}
              >
                <ArtistIcon />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">
                    <HighlightedText
                      html={artist._formatted?.name || artist.name}
                    />
                  </div>
                  {artist.nationality && (
                    <div className="text-xs text-muted truncate">
                      {artist.nationality}
                    </div>
                  )}
                </div>
                <svg className="w-4 h-4 text-muted/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}
        </div>
      )}

      {/* Paintings */}
      {results.paintings.length > 0 && (
        <div>
          <div className="px-4 py-2 text-[11px] font-semibold text-warm uppercase tracking-wider flex items-center gap-2">
            <span className="w-4 h-px bg-warm/30"></span>
            Paintings
          </div>
          {results.paintings.map((painting, i) => {
            const idx = runningIndex++;
            return (
              <button
                key={painting.id || i}
                onClick={() => onSelect({ ...painting, _type: "painting" })}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 ${
                  idx === activeIndex
                    ? "bg-warm/8 border-l-2 border-l-warm"
                    : "hover:bg-accent/60 border-l-2 border-l-transparent"
                }`}
                role="option"
                aria-selected={idx === activeIndex}
              >
                <PaintingIcon />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">
                    <HighlightedText
                      html={painting._formatted?.title || painting.title}
                    />
                  </div>
                  <div className="text-xs text-muted truncate">
                    {painting.artistName}
                    {painting.medium ? ` · ${painting.medium}` : ""}
                  </div>
                </div>
                <svg className="w-4 h-4 text-muted/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}
        </div>
      )}

      {/* Articles */}
      {results.articles.length > 0 && (
        <div>
          <div className="px-4 py-2 text-[11px] font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
            <span className="w-4 h-px bg-muted/30"></span>
            Articles
          </div>
          {results.articles.map((article, i) => {
            const idx = runningIndex++;
            return (
              <button
                key={article.id || i}
                onClick={() => onSelect({ ...article, _type: "article" })}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 ${
                  idx === activeIndex
                    ? "bg-accent border-l-2 border-l-muted"
                    : "hover:bg-accent/60 border-l-2 border-l-transparent"
                }`}
                role="option"
                aria-selected={idx === activeIndex}
              >
                <ArticleIcon />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">
                    <HighlightedText
                      html={article._formatted?.title || article.title}
                    />
                  </div>
                  {article.excerpt && (
                    <div className="text-xs text-muted truncate">
                      {article.excerpt}
                    </div>
                  )}
                </div>
                <svg className="w-4 h-4 text-muted/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}
        </div>
      )}

      {/* View all results */}
      {results.estimatedTotal > 0 && (
        <button
          onClick={onViewAll}
          className="w-full px-4 py-3 text-sm text-primary font-medium text-center border-t border-border/60 hover:bg-primary-light transition-all flex items-center justify-center gap-2"
        >
          View all {results.estimatedTotal} results
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      )}
    </div>
  );
}
