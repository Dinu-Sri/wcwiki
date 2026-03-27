"use client";

import { useState } from "react";
import { SearchBox, SearchCategory } from "@/components/search/SearchBox";

export default function Home() {
  const [category, setCategory] = useState<SearchCategory>("all");

  const tabs: { label: string; value: SearchCategory }[] = [
    { label: "All", value: "all" },
    { label: "Artists", value: "artists" },
    { label: "Paintings", value: "paintings" },
    { label: "Articles", value: "articles" },
  ];

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          <span className="text-primary">wc</span>
          <span className="text-foreground">WIKI</span>
        </h1>
        <p className="mt-2 text-muted text-sm md:text-base">
          The Watercolor Encyclopedia
        </p>
      </div>

      {/* Search Box */}
      <div className="w-full max-w-xl">
        <SearchBox size="large" autoFocus initialCategory={category} />
      </div>

      {/* Category Tabs */}
      <div className="mt-6 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setCategory(tab.value)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              category === tab.value
                ? "bg-primary text-white"
                : "bg-accent text-foreground hover:bg-primary hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-xs text-muted">
        <p>
          © {new Date().getFullYear()} wcWIKI.com — A community-driven
          watercolor encyclopedia
        </p>
        <p className="mt-1">
          All artworks are listed for educational purposes only. Rights belong to
          respective artists.
        </p>
      </footer>
    </main>
  );
}
