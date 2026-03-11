import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const LOADING_MESSAGES = [
  "Consulting the Cabinet...",
  "Drafting legal framework...",
  "Alerting the press pool...",
  "Locating the ceremonial pen...",
  "Finalizing presidential decree...",
  "Applying the official seal..."
];

export function GeneratingState() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full flex flex-col items-center justify-center py-24"
    >
      <div className="relative w-32 h-32 mb-12">
        <motion.img 
          src={`${import.meta.env.BASE_URL}images/seal.png`}
          alt="Loading Seal"
          className="w-full h-full object-contain"
          animate={{ rotateY: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
      </div>

      <div className="h-8 overflow-hidden">
        <motion.p 
          key={messageIndex}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="text-xl font-serif text-primary text-center italic"
        >
          {LOADING_MESSAGES[messageIndex]}
        </motion.p>
      </div>
    </motion.div>
  );
}
