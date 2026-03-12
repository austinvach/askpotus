import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full flex flex-col items-center justify-center text-center px-4"
    >
      <Link href="/" className="w-20 h-20 md:w-28 md:h-28 my-4 relative block hover:scale-105 transition-transform duration-300">
        <img
          src={`${import.meta.env.BASE_URL}images/seal.svg`}
          alt="Presidential Seal - Return to Home"
          className="w-full h-full object-contain drop-shadow-xl"
        />
      </Link>
    </motion.header>
  );
}
