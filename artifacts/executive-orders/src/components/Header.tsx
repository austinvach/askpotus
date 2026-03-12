import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";

interface HeaderProps {
  compact?: boolean;
}

export function Header({ compact = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isSmall = compact || scrolled;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={[
        "sticky top-[8px] z-50 w-full flex justify-center px-4 transition-all duration-500",
        isSmall ? "py-1" : "py-4",
      ].join(" ")}
    >
      <div
        className={[
          "flex items-center justify-center rounded-full transition-all duration-500",
          isSmall
            ? "bg-[#1a3a5c] shadow-lg px-3 py-1.5"
            : "bg-transparent px-0 py-0",
        ].join(" ")}
      >
        <Link
          href="/"
          className={[
            "relative block transition-all duration-500 hover:scale-105",
            isSmall ? "w-10 h-10 md:w-14 md:h-14" : "w-20 h-20 md:w-28 md:h-28",
          ].join(" ")}
        >
          <img
            src={`${import.meta.env.BASE_URL}images/seal.svg`}
            alt="Presidential Seal - Return to Home"
            className="w-full h-full object-contain drop-shadow-xl"
          />
        </Link>
      </div>
    </motion.header>
  );
}
