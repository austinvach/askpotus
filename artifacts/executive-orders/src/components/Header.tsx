import React, { useState, useEffect } from "react";
import { Link } from "wouter";

interface HeaderProps {
  compact?: boolean;
}

export function Header({ compact = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isSmall = compact || scrolled;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="h-2 w-full bg-gradient-to-r from-primary via-secondary to-primary" />
      <div
        className="w-full flex justify-center transition-all duration-500"
        style={{
          backgroundColor: isSmall ? "#1a3a5c" : "transparent",
          padding: isSmall ? "8px 0" : "16px 0",
        }}
      >
        <Link
          href="/"
          className="block transition-all duration-500 hover:opacity-90"
          style={{
            width: isSmall ? "48px" : "96px",
            height: isSmall ? "48px" : "96px",
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
