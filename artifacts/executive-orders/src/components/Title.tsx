import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const SEAL_LARGE = 96;
const SEAL_SMALL = 48;
const PAD_LARGE = 16;
const PAD_SMALL = 8;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

interface TitleProps {
  progress: number; // 0 at top, 1 after scrolling
}

export function Title({ progress }: TitleProps) {
  const sealSize = lerp(SEAL_LARGE, SEAL_SMALL, progress);
  const pad = lerp(PAD_LARGE, PAD_SMALL, progress);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full flex flex-col items-center justify-center text-center px-4"
    >
      {/* Presidential Seal */}
      <div
        style={{
          marginBottom: pad,
        }}
      >
        <Link
          href="/"
          style={{ width: sealSize, height: sealSize, display: "block" }}
          className="hover:opacity-90 transition-opacity"
        >
          <img
            src={`${import.meta.env.BASE_URL}images/seal.svg`}
            alt="Presidential Seal"
            className="w-full h-full object-contain drop-shadow-xl"
          />
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-5xl font-display font-bold text-primary mb-3 text-shadow-gold tracking-wider">
        EXECUTIVE ORDERS
      </h1>

      {/* Subtitle */}
      <p className="text-muted-foreground font-serif italic max-w-lg text-lg">
        Definitive answers to your personal dilemmas, issued by the President of
        the United States.
      </p>

      {/* Divider */}
      <div className="flex items-center justify-center gap-4 mt-6 w-full max-w-md">
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent flex-1 opacity-50" />
      </div>
    </motion.div>
  );
}
