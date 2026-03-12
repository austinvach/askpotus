import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useGenerateExecutiveOrder } from "@workspace/api-client-react";
import type { GenerateOrderRequestPresident, GenerateOrderResponse } from "@workspace/api-client-react/src/generated/api.schemas";
import { useToast } from "@/hooks/use-toast";
import { LN } from "@getalby/sdk";
import confetti from "canvas-confetti";

export type FlowStep = "SELECT_PRESIDENT" | "WRITE_DILEMMA" | "GENERATING" | "RESULT";
export type PaymentState = "idle" | "creating_invoice" | "awaiting_payment" | "paid";

declare global {
  interface Window {
    webln?: {
      enable: () => Promise<void>;
      sendPayment: (invoice: string) => Promise<{ preimage: string }>;
    };
  }
}

let lnClient: LN | null = null;

async function getLNClient(): Promise<LN> {
  if (lnClient) return lnClient;
  const res = await fetch("/api/executive-orders/nwc-config");
  if (!res.ok) throw new Error("Payment not configured");
  const { nwcUrl } = await res.json();
  lnClient = new LN(nwcUrl);
  return lnClient;
}

export function useOrderFlow() {
  const [step, setStep] = useState<FlowStep>("SELECT_PRESIDENT");
  const [selectedPresident, setSelectedPresident] = useState<GenerateOrderRequestPresident | null>(null);
  const [dilemma, setDilemma] = useState("");
  const [result, setResult] = useState<GenerateOrderResponse | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);
  const [, navigate] = useLocation();

  const { toast } = useToast();
  const generateMutation = useGenerateExecutiveOrder();

  const handleSelectPresident = (president: GenerateOrderRequestPresident) => {
    setSelectedPresident(president);
    setStep("WRITE_DILEMMA");
  };

  const handleBack = () => {
    if (step === "WRITE_DILEMMA") {
      setStep("SELECT_PRESIDENT");
      setSelectedPresident(null);
      setPaymentState("idle");
      setPaymentError(null);
      unsubRef.current?.();
    } else if (step === "RESULT") {
      setStep("SELECT_PRESIDENT");
      setSelectedPresident(null);
      setDilemma("");
      setResult(null);
      setPaymentState("idle");
      setPaymentError(null);
    }
  };

  const fireConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#0A3161', '#B31942', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#0A3161', '#B31942', '#ffffff']
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const generateOrder = useCallback(async () => {
    setStep("GENERATING");
    try {
      const response = await generateMutation.mutateAsync({
        data: {
          president: selectedPresident!,
          dilemma: dilemma.trim()
        }
      });
      setResult(response);
      setStep("RESULT");
      navigate(`/order/${response.id}`);
      setTimeout(fireConfetti, 500);
    } catch {
      toast({
        title: "Bureaucratic Error",
        description: "The Oval Office could not process your request at this time.",
        variant: "destructive"
      });
      setStep("WRITE_DILEMMA");
      setPaymentState("idle");
    }
  }, [selectedPresident, dilemma, generateMutation, navigate, toast]);

  const submitDilemma = async () => {
    if (!selectedPresident || !dilemma.trim()) {
      toast({
        title: "Incomplete Request",
        description: "Please specify your dilemma for the Commander in Chief.",
        variant: "destructive"
      });
      return;
    }

    setPaymentError(null);
    setPaymentState("creating_invoice");

    try {
      const ln = await getLNClient();
      const request = await ln.requestPayment({ satoshi: 10 }, {
        description: "Executive Order — 10 sats",
      });

      const bolt11 = request.invoice.paymentRequest;
      setPaymentState("awaiting_payment");

      const paymentPromise = new Promise<void>((resolve) => {
        request
          .onPaid(() => {
            console.log("Payment confirmed!");
            resolve();
          })
          .onTimeout(600, () => {
            console.log("Invoice expired");
          });
      });

      unsubRef.current = () => request.unsubscribe();

      const hasWebLN = typeof window !== "undefined" && "webln" in window;
      if (hasWebLN) {
        try {
          await window.webln!.enable();
          window.webln!.sendPayment(bolt11).catch(() => {});
        } catch {}
      } else {
        window.open(`lightning:${bolt11}`, "_self");
      }

      await paymentPromise;
      setPaymentState("paid");
      await generateOrder();

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed.";
      setPaymentError(msg);
      setPaymentState("idle");
    }
  };

  const cancelPayment = () => {
    unsubRef.current?.();
    unsubRef.current = null;
    setPaymentState("idle");
    setPaymentError(null);
  };

  return {
    step,
    selectedPresident,
    dilemma,
    setDilemma,
    result,
    paymentState,
    paymentError,
    isGenerating: generateMutation.isPending,
    handleSelectPresident,
    handleBack,
    submitDilemma,
    cancelPayment,
    reset: handleBack
  };
}
