import React from "react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full flex flex-col items-center justify-center text-center px-4"
    >
      <h1 className="text-3xl md:text-5xl font-display font-bold text-primary mb-3 text-shadow-gold tracking-wider">
        EXECUTIVE ORDERS
      </h1>
      <p className="text-muted-foreground font-serif italic max-w-lg text-lg">
        Definitive answers to your personal dilemmas, issued by the President of
        the United States.
      </p>
      <div className="flex items-center justify-center gap-4 mt-6 w-full max-w-md">
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent flex-1 opacity-50" />
      </div>
    </motion.div>
  );
}
