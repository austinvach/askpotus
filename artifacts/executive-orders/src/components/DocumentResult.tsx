import React from 'react';
import { motion } from 'framer-motion';
import type { GenerateOrderResponse } from '@workspace/api-client-react/src/generated/api.schemas';
import { RefreshCw } from 'lucide-react';

interface DocumentResultProps {
  result: GenerateOrderResponse;
  onReset: () => void;
}

export function DocumentResult({ result, onReset }: DocumentResultProps) {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center pb-20 px-4">
      <motion.div 
        initial={{ y: 100, opacity: 0, rotateX: 10 }}
        animate={{ y: 0, opacity: 1, rotateX: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, duration: 1 }}
        className="w-full bg-white box-shadow-document p-8 md:p-16 relative paper-texture mb-12"
        style={{ transformPerspective: 1000 }}
      >
        <div className="paper-content text-foreground">
          
          {/* Official Header */}
          <div className="flex flex-col items-center border-b-2 border-foreground pb-8 mb-10">
            <img 
              src={`${import.meta.env.BASE_URL}images/seal.png`} 
              alt="Seal" 
              className="w-24 h-24 mb-6 opacity-90 grayscale-[20%]"
            />
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-widest text-center">
              EXECUTIVE ORDER
            </h2>
            <div className="flex items-center gap-4 mt-6 w-full max-w-md">
              <div className="h-px bg-foreground flex-1" />
              <p className="font-serif font-bold text-lg tracking-wider">
                {result.orderNumber}
              </p>
              <div className="h-px bg-foreground flex-1" />
            </div>
          </div>

          {/* Title */}
          <div className="mb-10 text-center px-4 md:px-12">
            <h3 className="text-2xl md:text-3xl font-display font-bold leading-snug">
              {result.title}
            </h3>
          </div>

          {/* Body */}
          <div className="font-serif text-lg md:text-xl leading-relaxed space-y-6 text-justify mb-16">
            {result.body.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className={idx === 0 ? "first-letter:text-5xl first-letter:font-display first-letter:float-left first-letter:mr-2 first-letter:text-primary" : ""}>
                {paragraph}
              </p>
            ))}
          </div>

          {/* Signature Block */}
          <div className="flex flex-col md:flex-row justify-between items-end md:items-start pt-8 border-t border-foreground/20">
            <div className="order-2 md:order-1 mt-8 md:mt-0 font-serif text-sm">
              <p className="uppercase tracking-widest font-bold mb-1 text-xs">The White House</p>
              <p>{result.date}</p>
            </div>
            <div className="order-1 md:order-2 flex flex-col items-end text-right">
              <p className="text-5xl md:text-6xl font-script text-primary/80 -rotate-2 mb-2 pr-4 signature-shadow">
                {result.president}
              </p>
              <div className="w-64 h-px bg-foreground mb-2" />
              <p className="uppercase tracking-widest font-bold text-xs">
                President of the United States
              </p>
            </div>
          </div>

        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        onClick={onReset}
        className="group flex items-center gap-3 px-8 py-4 bg-background border-2 border-primary text-primary rounded-full font-display font-bold hover:bg-primary hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
        DRAFT ANOTHER ORDER
      </motion.button>
    </div>
  );
}
