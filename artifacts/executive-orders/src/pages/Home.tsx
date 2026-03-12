import React from "react";
import { AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PresidentSelector } from "@/components/PresidentSelector";
import { DilemmaForm } from "@/components/DilemmaForm";
import { GeneratingState } from "@/components/GeneratingState";
import { DocumentResult } from "@/components/DocumentResult";
import { Footer } from "@/components/Footer";
import { useOrderFlow } from "@/hooks/use-order-flow";

const LARGE_HEADER_H = 136;
const SMALL_HEADER_H = 72;

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
  const headerH = isSelectStep ? LARGE_HEADER_H : SMALL_HEADER_H;

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
      </div>

      <Header compact={!isSelectStep} />

      <div
        className="flex-1 relative z-10 flex flex-col transition-all duration-500"
        style={{ paddingTop: headerH }}
      >
        <AnimatePresence>
          {isSelectStep && <Hero key="hero" />}
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
