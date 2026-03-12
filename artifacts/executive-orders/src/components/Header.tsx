import React, { useState, useEffect } from "react";
import { Link } from "wouter";

interface HeaderProps {
  compact?: boolean;
}

const LARGE_SIZE = 96;
const SMALL_SIZE = 48;
const LARGE_PAD = 16;
const SMALL_PAD = 8;
const SCROLL_RANGE = 100;

export function Header({ compact = false }: HeaderProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (compact) return;
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    setScrollY(window.scrollY);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [compact]);

  const progress = compact ? 1 : Math.min(scrollY / SCROLL_RANGE, 1);

  const sealSize = LARGE_SIZE + (SMALL_SIZE - LARGE_SIZE) * progress;
  const pad = LARGE_PAD + (SMALL_PAD - LARGE_PAD) * progress;
  const navyOpacity = progress;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="h-2 w-full bg-gradient-to-r from-primary via-secondary to-primary" />
      <div
        className="w-full flex justify-center"
        style={{
          padding: `${pad}px 0`,
          backgroundColor: `rgba(26, 58, 92, ${navyOpacity})`,
        }}
      >
        <Link
          href="/"
          className="block hover:opacity-90"
          style={{
            width: `${sealSize}px`,
            height: `${sealSize}px`,
          }}
        >
          <img
            src={`${import.meta.env.BASE_URL}images/seal.svg`}
            alt="Presidential Seal - Return to Home"
            className="w-full h-full object-contain drop-shadow-xl"
          />
        </Link>
      </div>
    </header>
  );
}
