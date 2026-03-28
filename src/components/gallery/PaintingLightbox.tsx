"use client";

import { useState, useEffect, useCallback } from "react";

interface PaintingLightboxProps {
  images: string[];
  title: string;
}

export function PaintingLightbox({ images, title }: PaintingLightboxProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const close = useCallback(() => setOpen(false), []);
  const prev = useCallback(
    () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1)),
    [images.length]
  );
  const next = useCallback(
    () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1)),
    [images.length]
  );

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

  if (images.length === 0) return null;

  return (
    <>
      {/* Main image - clickable */}
      <div
        className="mb-8 rounded-2xl overflow-hidden bg-accent shadow-md cursor-zoom-in group"
        onClick={() => {
          setIndex(0);
          setOpen(true);
        }}
      >
        <div className="relative">
          <img
            src={images[0]}
            alt={title}
            className="w-full max-h-[70vh] object-contain mx-auto"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white opacity-0 group-hover:opacity-70 transition-opacity duration-200 drop-shadow-lg"
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
      </div>

      {/* Additional images grid - clickable */}
      {images.length > 1 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            More Views
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.slice(1).map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  setIndex(i + 1);
                  setOpen(true);
                }}
                className="aspect-square rounded-xl overflow-hidden bg-accent cursor-zoom-in group"
              >
                <div className="relative w-full h-full">
                  <img
                    src={img}
                    alt={`${title} — view ${i + 2}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white opacity-0 group-hover:opacity-70 transition-opacity duration-200 drop-shadow-lg"
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
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={close}
          />

          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="absolute top-4 left-4 z-10 text-white/60 text-sm font-medium">
            {index + 1} / {images.length}
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 sm:left-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Previous"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={next}
                className="absolute right-2 sm:right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Next"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          <div className="relative z-[1] max-w-[90vw] max-h-[80vh] flex flex-col items-center">
            <img
              src={images[index]}
              alt={`${title} — view ${index + 1}`}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="mt-3 text-center">
              <h3 className="text-white text-base font-medium">{title}</h3>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
