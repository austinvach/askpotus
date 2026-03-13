import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export function Title() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-full flex flex-col items-center justify-center text-center"
    >
      {/* Presidential Seal */}
      <div className="pb-4">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <img
            src={`${import.meta.env.BASE_URL}images/seal.svg`}
            alt="Presidential Seal"
            className="size-30 object-contain drop-shadow-xl"
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
