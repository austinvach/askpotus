import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Title } from "@/components/Title";
import { PresidentSelector } from "@/components/PresidentSelector";
import { DilemmaForm } from "@/components/DilemmaForm";
import { GeneratingState } from "@/components/GeneratingState";
import { DocumentResult } from "@/components/DocumentResult";
import { Footer } from "@/components/Footer";
import { useOrderFlow } from "@/hooks/use-order-flow";

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

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-x-hidden">
      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
      </div>

      {/* Fixed header — gradient bar only */}
      <Header />

      {/* Content with header margin */}
      <div className="flex-1 relative z-20 flex flex-col">
        <AnimatePresence>
          {isSelectStep && <Title key="title" progress={0} />}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.main
            key={step}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex-1 w-full pt-6 flex flex-col items-center justify-start"
          >
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
          </motion.main>
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}
