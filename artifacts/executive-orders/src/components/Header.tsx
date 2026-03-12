import React from "react";
import { Link } from "wouter";
import { useHeaderScroll } from "@/hooks/use-header-scroll";

interface HeaderProps {
  compact?: boolean;
}

export function Header({ compact = false }: HeaderProps) {
  const { sealSize, pad, navyOpacity } = useHeaderScroll(compact);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="h-2 w-full bg-gradient-to-r from-primary via-secondary to-primary" />
      <div
        className="w-full flex justify-center will-change-auto"
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
