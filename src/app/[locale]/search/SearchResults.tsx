"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { SearchBox, SearchCategory } from "@/components/search/SearchBox";
import { ArtistCard } from "@/components/cards/ArtistCard";
import { PaintingCard } from "@/components/cards/PaintingCard";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

interface SearchResults {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  artists: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paintings: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  articles: any[];
  estimatedTotal: number;
}

interface CategoryResults {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hits: any[];
  estimatedTotal: number;
  limit: number;
  offset: number;
}

const TABS: { label: string; value: SearchCategory; icon: string }[] = [
  { label: "All", value: "all", icon: "M4 6h16M4 12h16M4 18h16" },
  { label: "Articles", value: "articles", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { label: "Paintings", value: "paintings", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { label: "Artists", value: "artists", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const q = searchParams.get("q") || "";
  const cat = (searchParams.get("category") || "all") as SearchCategory;
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = Math.max(1, pageParam);

  const [category, setCategory] = useState<SearchCategory>(cat);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [categoryResults, setCategoryResults] = useState<CategoryResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const LIMIT = 10;

  // Build URL with params
  const buildUrl = useCallback((params: { q?: string; category?: string; page?: number }) => {
    const sp = new URLSearchParams();
    if (params.q || q) sp.set("q", params.q || q);
    if (params.category && params.category !== "all") sp.set("category", params.category);
    if (params.page && params.page > 1) sp.set("page", String(params.page));
    return `/search?${sp.toString()}`;
  }, [q]);

  const fetchResults = useCallback(
    async (searchQuery: string, searchCategory: SearchCategory, page: number) => {
      if (!searchQuery.trim()) return;
      setIsLoading(true);
      try {
        const offset = (page - 1) * LIMIT;
        const params = new URLSearchParams({
          q: searchQuery,
          category: searchCategory,
          limit: String(LIMIT),
          offset: String(offset),
          locale,
        });
        const res = await fetch(`/api/search?${params}`);
        if (res.ok) {
          const data = await res.json();
          if (searchCategory === "all") {
            setResults(data);
            setCategoryResults(null);
          } else {
            setCategoryResults(data);
            setResults(null);
          }
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false);
      }
    },
    [locale]
  );

  useEffect(() => {
    fetchResults(q, category, currentPage);
  }, [q, category, currentPage, fetchResults]);

  // Sync category from URL
  useEffect(() => {
    setCategory(cat);
  }, [cat]);

  const handleTabChange = (tab: SearchCategory) => {
    setCategory(tab);
    router.push(buildUrl({ category: tab, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    router.push(buildUrl({ category, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Count totals for tab badges
  const allTotal = results?.estimatedTotal || categoryResults?.estimatedTotal || 0;

  // All-category data
  const artists = results?.artists || (category === "artists" ? categoryResults?.hits : []) || [];
  const paintings = results?.paintings || (category === "paintings" ? categoryResults?.hits : []) || [];
  const articles = results?.articles || (category === "articles" ? categoryResults?.hits : []) || [];

  return (
    <main className="flex-1 flex flex-col min-h-screen">
      {/* Header with search — compact on mobile */}
      <div className="glass border-b border-border/60 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <a href="/" className="shrink-0 group">
              <img src="/logo.webp" alt="wcWIKI" className="h-6 sm:h-8 w-auto group-hover:scale-110 transition-transform duration-300" />
            </a>
            <div className="flex-1">
              <SearchBox initialQuery={q} initialCategory={category} />
            </div>
            <LanguageSwitcher compact />
          </div>
        </div>

        {/* Category tabs — inline under search on mobile, minimal */}
        <div className="max-w-5xl mx-auto px-3 sm:px-4">
          <div className="flex gap-0 border-b-0 overflow-x-auto scrollbar-none -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`flex items-center gap-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 ${
                  category === tab.value
                    ? "border-primary text-primary"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                <svg className="w-3.5 h-3.5 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-3 sm:px-4 py-3 sm:py-6">
        {/* Results info */}
        {q && (
          <div className="flex items-center gap-2 mb-3 sm:mb-6">
            <p className="text-xs sm:text-sm text-muted">
              {isLoading
                ? "Searching…"
                : category !== "all" && allTotal > LIMIT
                  ? `Page ${currentPage} of about ${allTotal} results for "${q}"`
                  : `About ${allTotal} results for "${q}"`}
            </p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="mt-4 text-sm text-muted">Searching the collection…</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && (
          <div className="space-y-6 sm:space-y-10 stagger-children">
            {/* Articles section — shown first */}
            {articles.length > 0 && (
              <section>
                {category === "all" && (
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-accent flex items-center justify-center">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      Articles
                    </h2>
                    <button
                      onClick={() => handleTabChange("articles")}
                      className="text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1 transition-colors"
                    >
                      View all
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
                <div className="space-y-1">
                  {articles.map((article: Record<string, unknown>) => (
                    <ArticleCard
                      key={article.id as string}
                      slug={article.slug as string}
                      title={article.title as string}
                      excerpt={article.excerpt as string}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Paintings section — Google Images grid */}
            {paintings.length > 0 && (
              <section>
                {category === "all" && (
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-warm-light flex items-center justify-center">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      Paintings
                    </h2>
                    <button
                      onClick={() => handleTabChange("paintings")}
                      className="text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1 transition-colors"
                    >
                      View all
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {paintings.map((painting: Record<string, unknown>) => (
                    <PaintingCard
                      key={painting.id as string}
                      slug={painting.slug as string}
                      title={painting.title as string}
                      artistName={painting.artistName as string}
                      medium={painting.medium as string}
                      year={painting.year as number}
                      images={painting.images as string[]}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Artists section — shown last */}
            {artists.length > 0 && (
              <section>
                {category === "all" && (
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary-light flex items-center justify-center">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      Artists
                    </h2>
                    <button
                      onClick={() => handleTabChange("artists")}
                      className="text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1 transition-colors"
                    >
                      View all
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
                <div className="space-y-1">
                  {artists.map((artist: Record<string, unknown>) => (
                    <ArtistCard
                      key={artist.id as string}
                      slug={artist.slug as string}
                      name={artist.name as string}
                      nationality={artist.nationality as string}
                      birthYear={artist.birthYear as number}
                      deathYear={artist.deathYear as number}
                      bio={artist.bio as string}
                      styles={artist.styles as string[]}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* No results */}
            {allTotal === 0 && !isLoading && q && (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto rounded-full bg-accent flex items-center justify-center mb-5">
                  <svg className="w-10 h-10 text-muted/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
                <p className="text-muted text-sm max-w-md mx-auto leading-relaxed">
                  We couldn&apos;t find anything matching &ldquo;{q}&rdquo;. Try different keywords, check your spelling, or browse our categories.
                </p>
              </div>
            )}

            {/* Pagination — Google style */}
            {allTotal > 0 && category !== "all" && (
              <Pagination
                currentPage={currentPage}
                totalResults={allTotal}
                perPage={LIMIT}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// Google-style pagination component
function Pagination({
  currentPage,
  totalResults,
  perPage,
  onPageChange,
}: {
  currentPage: number;
  totalResults: number;
  perPage: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(totalResults / perPage);
  if (totalPages <= 1) return null;

  // Calculate visible page range (show max 10 pages centered on current)
  const maxVisible = 10;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className="flex items-center justify-center gap-1 py-8" aria-label="Pagination">
      {/* Previous */}
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="flex items-center gap-1 px-3 py-2 text-sm text-primary hover:text-primary-hover font-medium rounded-lg hover:bg-accent transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </button>
      )}

      {/* Page numbers */}
      <div className="flex items-center gap-0.5">
        {start > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-9 h-9 flex items-center justify-center text-sm rounded-lg text-primary hover:bg-accent transition-colors"
            >
              1
            </button>
            {start > 2 && <span className="w-9 h-9 flex items-center justify-center text-muted text-sm">…</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 flex items-center justify-center text-sm rounded-lg transition-colors ${
              page === currentPage
                ? "bg-primary text-white font-bold shadow-sm"
                : "text-primary hover:bg-accent"
            }`}
          >
            {page}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="w-9 h-9 flex items-center justify-center text-muted text-sm">…</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-9 h-9 flex items-center justify-center text-sm rounded-lg text-primary hover:bg-accent transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      {/* Next */}
      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="flex items-center gap-1 px-3 py-2 text-sm text-primary hover:text-primary-hover font-medium rounded-lg hover:bg-accent transition-colors"
        >
          <span className="hidden sm:inline">Next</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </nav>
  );
}
