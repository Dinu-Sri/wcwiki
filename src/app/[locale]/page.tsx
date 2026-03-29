"use client";

import { useState, useEffect } from "react";
import { SearchBox, SearchCategory } from "@/components/search/SearchBox";
import { UserMenu } from "@/components/auth/UserMenu";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { SuggestButton } from "@/components/SuggestButton";
import { NotificationBell } from "@/components/NotificationBell";
import Link from "next/link";

export default function Home() {
  const [category, setCategory] = useState<SearchCategory>("all");
  const [stats, setStats] = useState({ artists: 0, paintings: 0, articles: 0 });

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  const tabs: { label: string; value: SearchCategory; icon: string }[] = [
    { label: "All", value: "all", icon: "M4 6h16M4 12h16M4 18h16" },
    { label: "Artists", value: "artists", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { label: "Paintings", value: "paintings", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { label: "Articles", value: "articles", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ];

  const formatCount = (n: number) => n.toLocaleString();

  return (
    <main className="flex flex-col h-screen overflow-hidden watercolor-wash relative">
      {/* Top bar — right-aligned auth */}
      <div className="w-full flex items-center justify-end gap-1 px-4 sm:px-6 py-2 animate-fade-in-up">
        <LanguageSwitcher compact />
        <SuggestButton />
        <NotificationBell />
        <UserMenu />
      </div>

      {/* Centered content area — pushes to visual center */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4">
        {/* Logo */}
        <div className="mb-4 md:mb-8 text-center animate-fade-in-up">
          <div className="mb-1 sm:mb-3 flex items-center justify-center">
            <img src="/logo.webp" alt="wcWIKI" className="h-10 sm:h-20 md:h-24 w-auto" />
          </div>
          {/* Tagline — always visible */}
          <p className="text-muted text-xs sm:text-base tracking-wide">
            The Watercolor Art Encyclopedia
          </p>
        </div>

        {/* Search Box */}
        <div className="w-full max-w-xl animate-fade-in-up relative z-50" style={{ animationDelay: "100ms" }}>
          <SearchBox size="large" initialCategory={category} />
        </div>

        {/* Stats — always visible, compact on mobile */}
        <div className="mt-4 sm:mt-8 flex items-center gap-4 sm:gap-6 text-center animate-fade-in-up relative z-0" style={{ animationDelay: "200ms" }}>
          <Link href="/paintings" className="hover:opacity-70 transition-opacity">
            <div className="text-sm sm:text-lg font-semibold text-foreground">{formatCount(stats.paintings)}</div>
            <div className="text-[10px] sm:text-[11px] text-muted">Paintings</div>
          </Link>
          <div className="w-px h-4 sm:h-6 bg-border"></div>
          <Link href="/articles" className="hover:opacity-70 transition-opacity">
            <div className="text-sm sm:text-lg font-semibold text-foreground">{formatCount(stats.articles)}</div>
            <div className="text-[10px] sm:text-[11px] text-muted">Articles</div>
          </Link>
          <div className="w-px h-4 sm:h-6 bg-border"></div>
          <Link href="/artists" className="hover:opacity-70 transition-opacity">
            <div className="text-sm sm:text-lg font-semibold text-foreground">{formatCount(stats.artists)}</div>
            <div className="text-[10px] sm:text-[11px] text-muted">Artists</div>
          </Link>
        </div>

        {/* Category Tabs — hidden on mobile */}
        <div className="hidden sm:flex mt-5 flex-wrap justify-center gap-2 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setCategory(tab.value)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
                category === tab.value
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "bg-transparent text-muted border border-border hover:border-primary/30 hover:text-foreground"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom footer — minimal */}
      <footer className="border-t border-border bg-surface/50">
        <div className="px-4 sm:px-8 py-2 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-muted/70">
          <p>© {new Date().getFullYear()} wcWIKI.com</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Use</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
