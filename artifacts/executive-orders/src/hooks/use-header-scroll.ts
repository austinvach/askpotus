const SCROLL_RANGE = 100;

export const LARGE_SEAL = 96;
export const SMALL_SEAL = 48;
export const LARGE_PAD = 16;
export const SMALL_PAD = 8;
export const GRADIENT_H = 8;

export function calcHeaderHeight(progress: number) {
  const seal = LARGE_SEAL + (SMALL_SEAL - LARGE_SEAL) * progress;
  const pad = LARGE_PAD + (SMALL_PAD - LARGE_PAD) * progress;
  return GRADIENT_H + pad * 2 + seal;
}

export function calcProgress(scrollY: number) {
  return Math.min(scrollY / SCROLL_RANGE, 1);
}

export const LARGE_HEADER_H = calcHeaderHeight(0);
export const COMPACT_HEADER_H = calcHeaderHeight(1);
