"use client";

import { useState } from "react";
import { SearchBox, SearchCategory } from "@/components/search/SearchBox";

export default function Home() {
  const [category, setCategory] = useState<SearchCategory>("all");

  const tabs: { label: string; value: SearchCategory; icon: string }[] = [
    { label: "All", value: "all", icon: "M4 6h16M4 12h16M4 18h16" },
    { label: "Artists", value: "artists", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { label: "Paintings", value: "paintings", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { label: "Articles", value: "articles", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ];

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 watercolor-wash min-h-screen relative">
      {/* Logo & tagline */}
      <div className="mb-10 text-center animate-fade-in-up">
        <div className="mb-4 flex items-center justify-center gap-3">
          {/* Watercolor palette icon */}
          <svg className="w-10 h-10 md:w-12 md:h-12 text-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="text-primary">wc</span>
            <span className="text-foreground">WIKI</span>
          </h1>
        </div>
        <p className="text-muted text-base md:text-lg tracking-wide">
          The Watercolor Art Encyclopedia
        </p>
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <span className="w-8 h-px bg-border"></span>
          <span className="text-xs text-muted/60 uppercase tracking-widest">Search · Discover · Learn</span>
          <span className="w-8 h-px bg-border"></span>
        </div>
      </div>

      {/* Search Box */}
      <div className="w-full max-w-2xl animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <SearchBox size="large" autoFocus initialCategory={category} />
      </div>

      {/* Category Tabs */}
      <div className="mt-8 flex gap-2 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setCategory(tab.value)}
            className={`group flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ${
              category === tab.value
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-card text-muted border border-border hover:border-primary/30 hover:text-foreground hover:shadow-sm"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quick stats */}
      <div className="mt-16 flex items-center gap-8 text-center animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        <div>
          <div className="text-2xl font-bold text-foreground">500+</div>
          <div className="text-xs text-muted mt-0.5">Artists</div>
        </div>
        <div className="w-px h-8 bg-border"></div>
        <div>
          <div className="text-2xl font-bold text-foreground">2,000+</div>
          <div className="text-xs text-muted mt-0.5">Paintings</div>
        </div>
        <div className="w-px h-8 bg-border"></div>
        <div>
          <div className="text-2xl font-bold text-foreground">100+</div>
          <div className="text-xs text-muted mt-0.5">Articles</div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-xs text-muted/60">
        <p>
          © {new Date().getFullYear()} wcWIKI.com — A community-driven
          watercolor encyclopedia
        </p>
      </footer>
    </main>
  );
}
