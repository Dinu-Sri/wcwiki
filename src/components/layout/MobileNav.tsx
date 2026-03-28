"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-accent transition-colors"
        aria-label="Menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setOpen(false)}
          />
          <nav className="fixed top-14 left-0 right-0 bg-card border-b border-border shadow-lg z-50 animate-fade-in-up">
            <div className="px-4 py-3 space-y-1">
              <Link
                href="/artists"
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-accent transition-colors"
              >
                Artists
              </Link>
              <Link
                href="/paintings"
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-accent transition-colors"
              >
                Paintings
              </Link>
              <Link
                href="/articles"
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-accent transition-colors"
              >
                Articles
              </Link>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
