import React from "react";
import { motion } from "framer-motion";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full py-8 md:py-12 flex flex-col items-center justify-center text-center px-4 pt-[0px] pb-[0px]"
    >
      <div className="w-20 h-20 md:w-28 md:h-28 mb-6 relative">
        <img
          src={`${import.meta.env.BASE_URL}images/seal.svg`}
          alt="Presidential Seal"
          className="w-full h-full object-contain drop-shadow-xl"
        />
      </div>
      <h1 className="text-3xl md:text-5xl font-display font-bold text-primary mb-3 text-shadow-gold tracking-wider">
        EXECUTIVE ORDERS
      </h1>
      <p className="text-muted-foreground font-serif italic max-w-lg text-lg">
        Definitive answers to your personal dilemmas, issued by the President of
        the United States.
      </p>
      <div className="flex items-center justify-center gap-4 mt-6 mb-6 w-full max-w-md">
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent flex-1 opacity-50" />
        <div className="w-2 h-2 rounded-full bg-secondary rotate-45 transform" />
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent flex-1 opacity-50" />
      </div>
    </motion.header>
  );
}
