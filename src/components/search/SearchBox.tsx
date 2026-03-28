"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

export type SearchCategory = "all" | "artists" | "paintings" | "articles";

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
  const [suggestions, setSuggestions] = useState<{ text: string; highlighted: string; count?: number }[]>([]);
  const [trending, setTrending] = useState<{ text: string; highlighted: string; count?: number }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mode, setMode] = useState<"trending" | "suggestions">("trending");
  const trendingFetchedRef = useRef(false);
  const userInteractedRef = useRef(false);

  // Keep category in sync with parent prop
  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);
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

  // Fetch keyword suggestions as user types
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 1) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setMode("suggestions");
        setShowDropdown(true);
        setActiveIndex(-1);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Current items shown in dropdown
  const dropdownItems = mode === "trending" ? trending : suggestions;

  const handleInputChange = (value: string) => {
    userInteractedRef.current = true;
    setQuery(value);
    if (value.length < 1) {
      setMode("trending");
      setSuggestions([]);
      setShowDropdown(true);
      fetchTrending();
    }
    // Don't switch mode to "suggestions" here — wait until results arrive
    // so the trending dropdown stays visible during the debounce wait
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.length >= 1) {
        fetchSuggestions(value);
      }
    }, 150);
  };

  const handleSuggestionClick = (item: typeof dropdownItems[number]) => {
    setQuery(item.text);
    setShowDropdown(false);
    navigateToSearch(item.text);
  };

  const navigateToSearch = (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    setShowDropdown(false);
    const params = new URLSearchParams({ q: q.trim() });
    if (category !== "all") params.set("category", category);
    router.push(`/search?${params}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || dropdownItems.length === 0) {
      if (e.key === "Enter") {
        navigateToSearch();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < dropdownItems.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : dropdownItems.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < dropdownItems.length) {
          const selected = dropdownItems[activeIndex];
          handleSuggestionClick(selected);
        } else {
          navigateToSearch();
        }
        break;
      case "Escape":
        setShowDropdown(false);
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
        setShowDropdown(false);
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
      ? "py-3 sm:py-4 text-[16px] sm:text-base pl-11 sm:pl-13 pr-11 sm:pr-13"
      : "py-2 sm:py-2.5 text-[16px] sm:text-sm pl-9 sm:pl-11 pr-9 sm:pr-11";

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
            // Only show dropdown if user actually clicked/tapped the input
            if (!userInteractedRef.current) return;
            if (query.length >= 1 && suggestions.length > 0) {
              setMode("suggestions");
              setShowDropdown(true);
            } else {
              fetchTrending();
              setMode("trending");
              setShowDropdown(true);
            }
          }}
          onMouseDown={() => { userInteractedRef.current = true; }}
          placeholder='Search artists, paintings, articles… Use "quotes" for exact phrases'
          className={`w-full ${sizeClasses} rounded-2xl border border-border bg-card text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:shadow-md transition-all duration-200 placeholder:text-muted/50 ${
            showDropdown && (dropdownItems.length > 0 || (mode === "suggestions" && query.trim())) ? "rounded-b-none border-b-transparent shadow-md" : ""
          }`}
          autoFocus={autoFocus}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
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
              setSuggestions([]);
              setShowDropdown(true);
              setMode("trending");
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

      {/* Keyword suggestions dropdown */}
      {showDropdown && (dropdownItems.length > 0 || (mode === "suggestions" && query.trim())) && (
        <div className="absolute z-50 w-full bg-card border border-border border-t-0 rounded-b-2xl shadow-lg overflow-hidden">
          {dropdownItems.length > 0 && (
            <>
              <div className="px-4 py-2 text-[11px] font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mode === "trending" ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  )}
                </svg>
                {mode === "trending" ? "Trending Searches" : "Suggestions"}
              </div>
              {dropdownItems.slice(0, 8).map((item, idx) => (
                <button
                  key={`${item.text}-${idx}`}
                  onClick={() => handleSuggestionClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 ${
                    idx === activeIndex
                      ? "bg-primary/8 border-l-2 border-l-primary"
                      : "hover:bg-accent/60 border-l-2 border-l-transparent"
                  }`}
                  role="option"
                  aria-selected={idx === activeIndex}
                >
                  <svg className="w-4 h-4 text-muted/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mode === "trending" ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    )}
                  </svg>
                  <span className="text-sm text-foreground truncate">{item.text}</span>
                  {mode === "trending" && item.count && (
                    <span className="text-xs text-muted/60 ml-auto shrink-0">{item.count} searches</span>
                  )}
                </button>
              ))}
            </>
          )}
          {mode === "suggestions" && query.trim() && (
            <button
              onClick={() => navigateToSearch()}
              className="w-full px-4 py-3 text-sm text-primary font-medium text-center border-t border-border/60 hover:bg-primary-light transition-all flex items-center justify-center gap-2"
            >
              Search for &ldquo;{query.trim()}&rdquo;
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
