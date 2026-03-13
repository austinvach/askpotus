import React from "react";
import { motion } from "framer-motion";
import { GenerateOrderRequestPresident } from "@workspace/api-client-react/src/generated/api.schemas";

interface PresidentSelectorProps {
  onSelect: (president: GenerateOrderRequestPresident) => void;
}

const PRESIDENTS = [
  {
    id: GenerateOrderRequestPresident.trump,
    name: "Donald Trump",
    term: "45th & 47th",
    image: "trump.png",
    color: "from-red-600/80 to-red-500/80",
  },
  {
    id: GenerateOrderRequestPresident.biden,
    name: "Joe Biden",
    term: "46th",
    image: "biden.png",
    color: "from-blue-700/80 to-blue-500/80",
  },
];

const GRID_CLASSES: Record<number, string> = {
  1: "grid-cols-1 max-w-xs mx-auto",
  2: "grid-cols-2 max-w-2xl mx-auto",
  3: "grid-cols-3 max-w-4xl mx-auto",
  4: "grid-cols-2 lg:grid-cols-4",
};

export function PresidentSelector({ onSelect }: PresidentSelectorProps) {
  const count = PRESIDENTS.length;
  const gridClass = GRID_CLASSES[count] ?? GRID_CLASSES[4];

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-display font-semibold text-foreground">
          Select Your Commander in Chief
        </h2>
        <p className="text-muted-foreground font-serif mt-2">
          Who shall issue your binding resolution?
        </p>
      </div>

      <div className={`grid gap-4 md:gap-6 ${gridClass}`}>
        {PRESIDENTS.map((president) => (
          <motion.button
            key={president.id}
            onClick={() => onSelect(president.id)}
            className="group relative flex flex-col items-center text-left bg-white rounded-2xl overflow-hidden box-shadow-document transition-all duration-300 border-2 border-transparent hover:border-accent outline-none focus-visible:ring-4 focus-visible:ring-accent/30"
          >
            <div className="w-full aspect-[3/4] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              <img
                src={`${import.meta.env.BASE_URL}images/${president.image}`}
                alt={president.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 w-full p-5 z-20 transform transition-transform duration-300">
                <p className="text-accent text-xs font-bold tracking-widest uppercase mb-1 drop-shadow-md">
                  {president.term} President
                </p>
                <h3 className="text-white text-xl font-display font-bold leading-tight drop-shadow-lg">
                  {president.name}
                </h3>
              </div>
            </div>
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300 z-0" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
