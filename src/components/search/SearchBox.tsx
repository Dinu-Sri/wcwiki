"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchSuggestions } from "./SearchSuggestions";

export type SearchCategory = "all" | "artists" | "paintings" | "articles";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

interface SearchResult {
  artists: AnyRecord[];
  paintings: AnyRecord[];
  articles: AnyRecord[];
  estimatedTotal: number;
}

interface SearchBoxProps {
  initialQuery?: string;
  initialCategory?: SearchCategory;
  autoFocus?: boolean;
  size?: "default" | "large";
}

export function SearchBox({
  initialQuery = "",
  initialCategory = "all",
  autoFocus = false,
  size = "default",
}: SearchBoxProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<SearchCategory>(initialCategory);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [trending, setTrending] = useState<{ query: string; count: number }[]>([]);
  const [showTrending, setShowTrending] = useState(false);
  const trendingFetchedRef = useRef(false);

  // Keep category in sync with parent prop
  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Fetch trending suggestions once
  const fetchTrending = useCallback(async () => {
    if (trendingFetchedRef.current) return;
    trendingFetchedRef.current = true;
    try {
      const res = await fetch("/api/search/suggest");
      if (res.ok) {
        const data = await res.json();
        setTrending(data.suggestions || []);
      }
    } catch {
      // ignore
    }
  }, []);

  // Flatten results for keyboard navigation
  const flatResults: AnyRecord[] = results
    ? [
        ...results.artists.map((r) => ({ ...r, _type: "artist" })),
        ...results.paintings.map((r) => ({ ...r, _type: "painting" })),
        ...results.articles.map((r) => ({ ...r, _type: "article" })),
      ]
    : [];

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults(null);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: searchQuery,
          category,
          limit: "5",
        });
        const res = await fetch(`/api/search?${params}`);
        if (res.ok) {
          const data = await res.json();
          // Normalize: if single-category, wrap into unified shape
          if (category !== "all" && data.hits) {
            const key =
              category === "artists"
                ? "artists"
                : category === "paintings"
                  ? "paintings"
                  : "articles";
            setResults({
              artists: key === "artists" ? data.hits : [],
              paintings: key === "paintings" ? data.hits : [],
              articles: key === "articles" ? data.hits : [],
              estimatedTotal: data.estimatedTotal || 0,
            });
          } else {
            setResults(data);
          }
          setIsOpen(true);
          setActiveIndex(-1);
        }
      } catch {
        // Silently fail — user can still submit
      } finally {
        setIsLoading(false);
      }
    },
    [category]
  );

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.length < 2) {
      setShowTrending(true);
      setIsOpen(false);
      setResults(null);
      fetchTrending();
    } else {
      setShowTrending(false);
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 150);
  };

  const navigateToSearch = (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    setIsOpen(false);
    setShowTrending(false);
    const params = new URLSearchParams({ q: q.trim() });
    if (category !== "all") params.set("category", category);
    router.push(`/search?${params}`);
  };

  const navigateToResult = (result: AnyRecord) => {
    setIsOpen(false);
    const slug = result.slug as string;
    if (result._type === "artist") {
      router.push(`/artists/${slug}`);
    } else if (result._type === "painting") {
      router.push(`/paintings/${slug}`);
    } else {
      router.push(`/articles/${slug}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || flatResults.length === 0) {
      if (e.key === "Enter") {
        navigateToSearch();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < flatResults.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : flatResults.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < flatResults.length) {
          navigateToResult(flatResults[activeIndex]);
        } else {
          navigateToSearch();
        }
        break;
      case "Escape":
        setIsOpen(false);
        setShowTrending(false);
        setActiveIndex(-1);
        break;
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setShowTrending(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const sizeClasses =
    size === "large"
      ? "py-3 sm:py-4 text-sm sm:text-base pl-11 sm:pl-13 pr-11 sm:pr-13"
      : "py-2.5 text-sm pl-10 sm:pl-11 pr-10 sm:pr-11";

  const iconSize = size === "large" ? "w-4 h-4 sm:w-5 sm:h-5" : "w-4 h-4";
  const iconLeft = size === "large" ? "left-3.5 sm:left-5" : "left-3 sm:left-4";

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative group">
        {/* Search icon */}
        <svg
          className={`absolute ${iconLeft} top-1/2 -translate-y-1/2 ${iconSize} text-muted group-focus-within:text-primary pointer-events-none transition-colors`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results && query.length >= 2) {
              setIsOpen(true);
            } else if (query.length < 2) {
              fetchTrending();
              setShowTrending(true);
            }
          }}
          placeholder="Search artists, paintings, articles…"
          className={`w-full ${sizeClasses} rounded-2xl border border-border bg-card text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:shadow-md transition-all duration-200 placeholder:text-muted/50 ${
            isOpen ? "rounded-b-none border-b-transparent shadow-md" : ""
          }`}
          autoFocus={autoFocus}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />

        {/* Loading spinner or clear button */}
        {isLoading ? (
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : query.length > 0 ? (
          <button
            onClick={() => {
              setQuery("");
              setResults(null);
              setIsOpen(false);
              setShowTrending(true);
              fetchTrending();
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted hover:text-foreground hover:bg-accent transition-all"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && results && (
        <SearchSuggestions
          results={results}
          activeIndex={activeIndex}
          onSelect={navigateToResult}
          onViewAll={() => navigateToSearch()}
          query={query}
        />
      )}

      {/* Trending suggestions */}
      {showTrending && !isOpen && trending.length > 0 && (
        <div className="absolute z-50 w-full glass border border-border border-t-0 rounded-b-2xl shadow-lg overflow-hidden">
          <div className="px-4 py-2 text-[11px] font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Trending Searches
          </div>
          {trending.slice(0, 6).map((item) => (
            <button
              key={item.query}
              onClick={() => {
                setQuery(item.query);
                setShowTrending(false);
                navigateToSearch(item.query);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-accent/60 transition-all duration-150"
            >
              <svg className="w-4 h-4 text-muted/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm text-foreground truncate">{item.query}</span>
              <span className="text-xs text-muted/60 ml-auto shrink-0">{item.count} searches</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
