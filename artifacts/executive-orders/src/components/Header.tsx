import React from "react";
import { Link } from "wouter";
import {
  LARGE_SEAL,
  SMALL_SEAL,
  LARGE_PAD,
  SMALL_PAD,
  GRADIENT_H,
} from "@/hooks/use-header-scroll";

interface HeaderProps {
  progress: number;
}

export function Header({ progress }: HeaderProps) {
  const sealSize = LARGE_SEAL + (SMALL_SEAL - LARGE_SEAL) * progress;
  const pad = LARGE_PAD + (SMALL_PAD - LARGE_PAD) * progress;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div style={{ height: GRADIENT_H }} className="w-full bg-gradient-to-r from-primary via-secondary to-primary" />
      <div
        className="w-full flex justify-center"
        style={{
          padding: `${pad}px 0`,
          backgroundColor: `rgba(26, 58, 92, ${progress})`,
        }}
      >
        <Link
          href="/"
          className="block hover:opacity-90"
          style={{ width: sealSize, height: sealSize }}
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
