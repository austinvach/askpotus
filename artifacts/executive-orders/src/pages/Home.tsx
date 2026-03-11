import React from "react";
import { AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { PresidentSelector } from "@/components/PresidentSelector";
import { DilemmaForm } from "@/components/DilemmaForm";
import { PaymentStep } from "@/components/PaymentStep";
import { GeneratingState } from "@/components/GeneratingState";
import { DocumentResult } from "@/components/DocumentResult";
import { useOrderFlow } from "@/hooks/use-order-flow";

export default function Home() {
  const {
    step,
    selectedPresident,
    dilemma,
    setDilemma,
    isGenerating,
    isCreatingInvoice,
    invoice,
    paymentHash,
    result,
    handleSelectPresident,
    handleBack,
    submitDilemma,
    onPaymentConfirmed,
    reset,
  } = useOrderFlow();

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-x-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
      </div>

      <div className="flex-1 relative z-10 flex flex-col pt-4 md:pt-8">
        {step !== "RESULT" && <Header />}

        <main className="flex-1 w-full pb-16 pt-4 flex flex-col items-center justify-start min-h-[500px]">
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
                isGenerating={isCreatingInvoice}
              />
            )}

            {step === "PAYMENT" && invoice && paymentHash && (
              <PaymentStep
                key="payment"
                invoice={invoice}
                paymentHash={paymentHash}
                onPaid={onPaymentConfirmed}
                onBack={handleBack}
              />
            )}

            {step === "GENERATING" && <GeneratingState key="generating" />}

            {step === "RESULT" && result && (
              <DocumentResult key="result" result={result} onReset={reset} />
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Footer */}
      {step !== "RESULT" && (
        <footer className="w-full py-6 text-center text-muted-foreground/60 font-serif text-sm relative z-10 space-y-1">
          <p>
            For entertainment purposes only. Not legally binding in any
            jurisdiction.
          </p>
          <p>
            <a
              href="https://austinvach.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
            >
              Who Would Build This?
            </a>
          </p>
        </footer>
      )}
    </div>
  );
}
