import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { PresidentSelector } from "@/components/PresidentSelector";
import { DilemmaForm } from "@/components/DilemmaForm";
import { GeneratingState } from "@/components/GeneratingState";
import { DocumentResult } from "@/components/DocumentResult";
import { Footer } from "@/components/Footer";
import { useOrderFlow } from "@/hooks/use-order-flow";

const SEAL_LARGE = 96;
const SEAL_SMALL = 48;
const PAD_LARGE = 16;
const PAD_SMALL = 8;
const GRADIENT_H = 8;
const SCROLL_RANGE = 100;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function Home() {
  const {
    step,
    selectedPresident,
    dilemma,
    setDilemma,
    paymentState,
    paymentError,
    result,
    handleSelectPresident,
    handleBack,
    submitDilemma,
    cancelPayment,
    reset,
  } = useOrderFlow();

  const isSelectStep = step === "SELECT_PRESIDENT";

  const [scrollY, setScrollY] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isSelectStep) {
      setScrollY(0);
      return;
    }
    const onScroll = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    setScrollY(window.scrollY);
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isSelectStep]);

  // t: 0 = large header (top of page), 1 = compact header (scrolled)
  const t = isSelectStep ? Math.min(scrollY / SCROLL_RANGE, 1) : 1;
  const sealSize = lerp(SEAL_LARGE, SEAL_SMALL, t);
  const pad = lerp(PAD_LARGE, PAD_SMALL, t);
  const heroOpacity = 1 - t;

  // Measure hero height so paddingTop can include it
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroH, setHeroH] = useState(148);
  useLayoutEffect(() => {
    if (heroRef.current) setHeroH(heroRef.current.offsetHeight);
  }, []);

  // paddingTop = full initial header height (seal area + hero)
  // held constant so content never jumps
  const HERO_PAD_TOP = 8;
  const HERO_PAD_BOT = 16;
  const sealAreaH = GRADIENT_H + PAD_LARGE * 2 + SEAL_LARGE;
  const totalPaddingTop = sealAreaH + HERO_PAD_TOP + heroH + HERO_PAD_BOT;

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-x-hidden">
      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
      </div>

      {/* Fixed header: gradient bar + seal + hero title (fades on scroll) */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}>
        {/* Gradient accent bar */}
        <div
          style={{ height: GRADIENT_H }}
          className="w-full bg-gradient-to-r from-primary via-secondary to-primary"
        />

        {/* Seal */}
        <div
          style={{
            padding: `${pad}px 0`,
            backgroundColor: `rgba(26, 58, 92, ${t})`,
          }}
          className="w-full flex justify-center"
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

        {/* Hero title — lives in the header so it never scrolls into the seal */}
        <div
          style={{
            backgroundColor: `rgba(26, 58, 92, ${t})`,
            opacity: heroOpacity,
            pointerEvents: heroOpacity < 0.1 ? "none" : "auto",
            paddingTop: HERO_PAD_TOP,
            paddingBottom: HERO_PAD_BOT,
          }}
          className="w-full"
        >
          {/* Hidden measurement copy (always rendered, opacity 0) */}
          <div
            ref={heroRef}
            className="absolute invisible pointer-events-none w-full flex flex-col items-center justify-center text-center px-4"
            aria-hidden
          >
            <h1 className="text-3xl md:text-5xl font-display font-bold text-primary mb-3 tracking-wider">
              EXECUTIVE ORDERS
            </h1>
            <p className="text-muted-foreground font-serif italic max-w-lg text-lg">
              Definitive answers to your personal dilemmas, issued by the
              President of the United States.
            </p>
            <div className="flex items-center justify-center gap-4 mt-6 w-full max-w-md">
              <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent flex-1 opacity-50" />
            </div>
          </div>

          {/* Visible hero content */}
          <div className="w-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl md:text-5xl font-display font-bold text-primary mb-3 text-shadow-gold tracking-wider">
              EXECUTIVE ORDERS
            </h1>
            <p className="text-muted-foreground font-serif italic max-w-lg text-lg">
              Definitive answers to your personal dilemmas, issued by the
              President of the United States.
            </p>
            <div className="flex items-center justify-center gap-4 mt-6 w-full max-w-md">
              <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent flex-1 opacity-50" />
            </div>
          </div>
        </div>
      </header>

      {/* Page content — constant paddingTop = full initial header height, no parallax */}
      <div
        className="flex-1 relative z-20 flex flex-col"
        style={{ paddingTop: totalPaddingTop }}
      >
        <main className="flex-1 w-full pt-6 flex flex-col items-center justify-start min-h-[500px]">
          <AnimatePresence mode="wait">
            {step === "SELECT_PRESIDENT" && (
              <PresidentSelector
                key="selector"
                onSelect={handleSelectPresident}
              />
            )}

            {step === "WRITE_DILEMMA" && selectedPresident && (
              <DilemmaForm
                key="form"
                president={selectedPresident}
                dilemma={dilemma}
                onChange={setDilemma}
                onSubmit={submitDilemma}
                onBack={handleBack}
                onCancelPayment={cancelPayment}
                paymentState={paymentState}
                paymentError={paymentError}
              />
            )}

            {step === "GENERATING" && <GeneratingState key="generating" />}

            {step === "RESULT" && result && (
              <DocumentResult key="result" result={result} onReset={reset} />
            )}
          </AnimatePresence>
        </main>
      </div>

      <Footer />
    </div>
  );
}
