import { useState, useEffect } from "react";

const SCROLL_RANGE = 100;
const LARGE_SIZE = 96;
const SMALL_SIZE = 48;
const LARGE_PAD = 16;
const SMALL_PAD = 8;
const GRADIENT_H = 8;

export function getHeaderHeight(progress: number) {
  const sealSize = LARGE_SIZE + (SMALL_SIZE - LARGE_SIZE) * progress;
  const pad = LARGE_PAD + (SMALL_PAD - LARGE_PAD) * progress;
  return GRADIENT_H + pad * 2 + sealSize;
}

export const COMPACT_HEADER_H = getHeaderHeight(1);
export const LARGE_HEADER_H = getHeaderHeight(0);

export function useHeaderScroll(compact: boolean) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (compact) return;
    const el = document.documentElement;
    const handleScroll = () => setScrollY(el.scrollTop || window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    setScrollY(window.scrollY);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [compact]);

  const progress = compact ? 1 : Math.min(scrollY / SCROLL_RANGE, 1);
  const headerHeight = getHeaderHeight(progress);
  const sealSize = LARGE_SIZE + (SMALL_SIZE - LARGE_SIZE) * progress;
  const pad = LARGE_PAD + (SMALL_PAD - LARGE_PAD) * progress;
  const navyOpacity = progress;

  return { progress, headerHeight, sealSize, pad, navyOpacity };
}
