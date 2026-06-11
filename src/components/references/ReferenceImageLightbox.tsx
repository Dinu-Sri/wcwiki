"use client";

import { useEffect, useState } from "react";

export function ReferenceImageLightbox({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "+") setZoom((value) => Math.min(3, value + 0.25));
      if (event.key === "-") setZoom((value) => Math.max(0.5, value - 0.25));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function resetView() {
    setZoom(1);
    setRotation(0);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full overflow-hidden rounded-xl border border-border bg-card text-left"
        aria-label="Open painting reference image"
      >
        <img
          src={src}
          alt={alt}
          className="max-h-[76vh] w-full object-contain bg-accent"
        />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/90">
          <div className="absolute right-3 top-3 z-10 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))}
              className="rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
            >
              Zoom -
            </button>
            <button
              type="button"
              onClick={() => setZoom((value) => Math.min(3, value + 0.25))}
              className="rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
            >
              Zoom +
            </button>
            <button
              type="button"
              onClick={() => setRotation((value) => value - 90)}
              className="rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
            >
              Rotate
            </button>
            <button
              type="button"
              onClick={resetView}
              className="rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90"
            >
              Close
            </button>
          </div>
          <div className="flex h-full w-full items-center justify-center overflow-auto p-6 sm:p-14">
            <img
              src={src}
              alt={alt}
              className="max-h-none max-w-none select-none transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "center",
                maxWidth: "90vw",
                maxHeight: "82vh",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
