"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseZoomOptions {
  minScale?: number;
  maxScale?: number;
  step?: number;
}

interface UseZoomReturn {
  scale: number;
  translateX: number;
  translateY: number;
  containerRef: React.RefObject<HTMLDivElement>;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  isZoomed: boolean;
}

export function useZoom({
  minScale = 1,
  maxScale = 5,
  step = 0.5,
}: UseZoomOptions = {}): UseZoomReturn {
  const [scale, setScale] = useState(minScale);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Panning state
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });

  // Pinch state
  const lastPinchDist = useRef(0);

  const clampScale = useCallback(
    (s: number) => Math.min(Math.max(s, minScale), maxScale),
    [minScale, maxScale]
  );

  const reset = useCallback(() => {
    setScale(minScale);
    setTranslate({ x: 0, y: 0 });
  }, [minScale]);

  const zoomIn = useCallback(() => {
    setScale((s) => clampScale(s + step));
  }, [clampScale, step]);

  const zoomOut = useCallback(() => {
    setScale((s) => {
      const next = clampScale(s - step);
      if (next <= minScale) setTranslate({ x: 0, y: 0 });
      return next;
    });
  }, [clampScale, step, minScale]);

  // Wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -step * 0.5 : step * 0.5;
      setScale((s) => {
        const next = clampScale(s + delta);
        if (next <= minScale) setTranslate({ x: 0, y: 0 });
        return next;
      });
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [clampScale, step, minScale]);

  // Mouse pan
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMouseDown = (e: MouseEvent) => {
      if (scale <= minScale) return;
      e.preventDefault();
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
      translateStart.current = { ...translate };
      el.style.cursor = "grabbing";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isPanning.current) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setTranslate({
        x: translateStart.current.x + dx,
        y: translateStart.current.y + dy,
      });
    };

    const onMouseUp = () => {
      isPanning.current = false;
      if (el) el.style.cursor = scale > minScale ? "grab" : "default";
    };

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [scale, translate, minScale]);

  // Touch pinch + pan
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const getTouchDist = (t1: Touch, t2: Touch) =>
      Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        lastPinchDist.current = getTouchDist(e.touches[0], e.touches[1]);
      } else if (e.touches.length === 1 && scale > minScale) {
        isPanning.current = true;
        panStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        translateStart.current = { ...translate };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = getTouchDist(e.touches[0], e.touches[1]);
        const delta = (dist - lastPinchDist.current) * 0.01;
        lastPinchDist.current = dist;
        setScale((s) => {
          const next = clampScale(s + delta);
          if (next <= minScale) setTranslate({ x: 0, y: 0 });
          return next;
        });
      } else if (e.touches.length === 1 && isPanning.current) {
        const dx = e.touches[0].clientX - panStart.current.x;
        const dy = e.touches[0].clientY - panStart.current.y;
        setTranslate({
          x: translateStart.current.x + dx,
          y: translateStart.current.y + dy,
        });
      }
    };

    const onTouchEnd = () => {
      isPanning.current = false;
      lastPinchDist.current = 0;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [scale, translate, clampScale, minScale]);

  // Double-click to toggle zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onDblClick = () => {
      if (scale > minScale) {
        reset();
      } else {
        setScale(clampScale(minScale + step * 2));
      }
    };

    el.addEventListener("dblclick", onDblClick);
    return () => el.removeEventListener("dblclick", onDblClick);
  }, [scale, minScale, clampScale, step, reset]);

  return {
    scale,
    translateX: translate.x,
    translateY: translate.y,
    containerRef,
    zoomIn,
    zoomOut,
    reset,
    isZoomed: scale > minScale,
  };
}
