"use client";

import { useState, useEffect, useCallback } from "react";

interface LightboxItem {
  src: string;
  title: string;
  subtitle?: string;
  href?: string;
}

interface LightboxGalleryProps {
  items: LightboxItem[];
  /** Which item index to open at, or -1/undefined for closed */
  initialIndex?: number;
}

export function LightboxGallery({ items }: LightboxGalleryProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const openAt = useCallback((i: number) => {
    setIndex(i);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const prev = useCallback(
    () => setIndex((i) => (i === 0 ? items.length - 1 : i - 1)),
    [items.length]
  );

  const next = useCallback(
    () => setIndex((i) => (i === items.length - 1 ? 0 : i + 1)),
    [items.length]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handle);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handle);
    };
  }, [open, close, prev, next]);

  const current = items[index];

  return (
    <>
      {/* Thumbnail grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => openAt(i)}
            className="group block rounded-xl overflow-hidden bg-card hover:shadow-lg transition-all duration-200 text-left cursor-pointer"
          >
            <div className="aspect-square bg-accent overflow-hidden relative">
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {/* Hover overlay with zoom icon */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white opacity-0 group-hover:opacity-80 transition-opacity duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
            </div>
            <div className="px-2 py-2">
              <h3 className="text-xs font-medium text-foreground truncate">
                {item.title}
              </h3>
              {item.subtitle && (
                <p className="text-xs text-muted truncate">{item.subtitle}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox overlay */}
      {open && current && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={close}
          />

          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 z-10 text-white/60 text-sm font-medium">
            {index + 1} / {items.length}
          </div>

          {/* Previous button */}
          {items.length > 1 && (
            <button
              onClick={prev}
              className="absolute left-2 sm:left-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Previous"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next button */}
          {items.length > 1 && (
            <button
              onClick={next}
              className="absolute right-2 sm:right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Next"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Main image */}
          <div className="relative z-[1] max-w-[90vw] max-h-[80vh] flex flex-col items-center">
            <img
              src={current.src}
              alt={current.title}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />
            {/* Caption */}
            <div className="mt-3 text-center">
              <h3 className="text-white text-base font-medium">
                {current.href ? (
                  <a href={current.href} className="hover:underline">
                    {current.title}
                  </a>
                ) : (
                  current.title
                )}
              </h3>
              {current.subtitle && (
                <p className="text-white/60 text-sm mt-0.5">
                  {current.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
