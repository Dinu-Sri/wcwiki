"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBox, SearchCategory } from "@/components/search/SearchBox";
import { ArtistCard } from "@/components/cards/ArtistCard";
import { PaintingCard } from "@/components/cards/PaintingCard";
import { ArticleCard } from "@/components/cards/ArticleCard";

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

const TABS: { label: string; value: SearchCategory }[] = [
  { label: "All", value: "all" },
  { label: "Artists", value: "artists" },
  { label: "Paintings", value: "paintings" },
  { label: "Articles", value: "articles" },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const cat = (searchParams.get("category") || "all") as SearchCategory;

  const [category, setCategory] = useState<SearchCategory>(cat);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [categoryResults, setCategoryResults] = useState<CategoryResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const fetchResults = useCallback(
    async (searchQuery: string, searchCategory: SearchCategory, searchOffset: number) => {
      if (!searchQuery.trim()) return;
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: searchQuery,
          category: searchCategory,
          limit: String(LIMIT),
          offset: String(searchOffset),
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
    []
  );

  useEffect(() => {
    setOffset(0);
    fetchResults(q, category, 0);
  }, [q, category, fetchResults]);

  const handleTabChange = (tab: SearchCategory) => {
    setCategory(tab);
    setOffset(0);
  };

  const loadMore = () => {
    const newOffset = offset + LIMIT;
    setOffset(newOffset);
    fetchResults(q, category, newOffset);
  };

  // Count totals for tab badges
  const allTotal = results?.estimatedTotal || categoryResults?.estimatedTotal || 0;

  // All-category data
  const artists = results?.artists || (category === "artists" ? categoryResults?.hits : []) || [];
  const paintings = results?.paintings || (category === "paintings" ? categoryResults?.hits : []) || [];
  const articles = results?.articles || (category === "articles" ? categoryResults?.hits : []) || [];

  return (
    <main className="flex-1 flex flex-col min-h-screen">
      {/* Header with search */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <a href="/" className="shrink-0 text-xl font-bold">
              <span className="text-primary">wc</span>
              <span className="text-foreground">WIKI</span>
            </a>
            <div className="flex-1">
              <SearchBox initialQuery={q} initialCategory={category} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 py-4">
        {/* Category tabs */}
        <div className="flex gap-1 border-b border-border mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                category === tab.value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results info */}
        {q && (
          <p className="text-sm text-muted mb-4">
            {isLoading
              ? "Searching…"
              : `About ${allTotal} results for "${q}"`}
          </p>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {/* Results */}
        {!isLoading && (
          <div className="space-y-8">
            {/* Artists section */}
            {artists.length > 0 && (
              <section>
                {category === "all" && (
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-foreground">Artists</h2>
                    <button
                      onClick={() => handleTabChange("artists")}
                      className="text-sm text-primary hover:underline"
                    >
                      View all →
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {artists.map((artist: Record<string, unknown>) => (
                    <ArtistCard
                      key={artist.id as string}
                      slug={artist.slug as string}
                      name={artist.name as string}
                      nationality={artist.nationality as string}
                      birthYear={artist.birthYear as number}
                      deathYear={artist.deathYear as number}
                      image={artist.image as string}
                      styles={artist.styles as string[]}
                      _formatted={artist._formatted as Record<string, string>}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Paintings section */}
            {paintings.length > 0 && (
              <section>
                {category === "all" && (
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-foreground">Paintings</h2>
                    <button
                      onClick={() => handleTabChange("paintings")}
                      className="text-sm text-primary hover:underline"
                    >
                      View all →
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {paintings.map((painting: Record<string, unknown>) => (
                    <PaintingCard
                      key={painting.id as string}
                      slug={painting.slug as string}
                      title={painting.title as string}
                      artistName={painting.artistName as string}
                      medium={painting.medium as string}
                      year={painting.year as number}
                      images={painting.images as string[]}
                      _formatted={painting._formatted as Record<string, string>}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Articles section */}
            {articles.length > 0 && (
              <section>
                {category === "all" && (
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-foreground">Articles</h2>
                    <button
                      onClick={() => handleTabChange("articles")}
                      className="text-sm text-primary hover:underline"
                    >
                      View all →
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {articles.map((article: Record<string, unknown>) => (
                    <ArticleCard
                      key={article.id as string}
                      slug={article.slug as string}
                      title={article.title as string}
                      excerpt={article.excerpt as string}
                      authorName={article.authorName as string}
                      publishedAt={article.publishedAt as string}
                      tags={article.tags as string[]}
                      _formatted={article._formatted as Record<string, string>}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* No results */}
            {allTotal === 0 && !isLoading && q && (
              <div className="text-center py-16">
                <svg className="w-16 h-16 mx-auto text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
                <p className="text-muted text-sm max-w-md mx-auto">
                  Try different keywords, check your spelling, or browse our categories.
                </p>
              </div>
            )}

            {/* Load more */}
            {category !== "all" && categoryResults && categoryResults.hits.length >= LIMIT && (
              <div className="text-center py-4">
                <button
                  onClick={loadMore}
                  className="px-6 py-2.5 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-hover transition-colors"
                >
                  Load more results
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
