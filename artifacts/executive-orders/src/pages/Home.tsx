import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Title } from "@/components/Title";
import { PresidentSelector } from "@/components/PresidentSelector";
import { DilemmaForm } from "@/components/DilemmaForm";
import { GeneratingState } from "@/components/GeneratingState";
import { DocumentResult } from "@/components/DocumentResult";
import { Footer } from "@/components/Footer";
import { useOrderFlow } from "@/hooks/use-order-flow";

const GRADIENT_H = 8;
const SCROLL_RANGE = 64;

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

  const progress = isSelectStep ? Math.min(scrollY / SCROLL_RANGE, 1) : 1;

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-x-hidden">
      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
      </div>

      {/* Fixed header — gradient bar only */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}>
        <div
          style={{ height: GRADIENT_H }}
          className="w-full bg-gradient-to-r from-primary via-secondary to-primary"
        />
      </header>

      {/* Content */}
      <div
        className="flex-1 relative z-20 flex flex-col"
        style={{ paddingTop: GRADIENT_H }}
      >
        <AnimatePresence>
          {isSelectStep && <Title key="title" progress={progress} />}
        </AnimatePresence>

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
