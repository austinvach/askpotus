import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useGenerateExecutiveOrder } from "@workspace/api-client-react";
import type { GenerateOrderRequestPresident, GenerateOrderResponse } from "@workspace/api-client-react/src/generated/api.schemas";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

export type FlowStep = "SELECT_PRESIDENT" | "WRITE_DILEMMA" | "GENERATING" | "RESULT";
export type PaymentState = "idle" | "creating_invoice" | "awaiting_payment" | "verifying" | "paid";

declare global {
  interface Window {
    webln?: {
      enable: () => Promise<void>;
      sendPayment: (invoice: string) => Promise<{ preimage: string }>;
    };
  }
}

function isMobileDevice(): boolean {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export function useOrderFlow() {
  const [step, setStep] = useState<FlowStep>("SELECT_PRESIDENT");
  const [selectedPresident, setSelectedPresident] = useState<GenerateOrderRequestPresident | null>(null);
  const [dilemma, setDilemma] = useState("");
  const [result, setResult] = useState<GenerateOrderResponse | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
      if (pollRef.current) clearInterval(pollRef.current);
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

  const pollForPayment = useCallback((paymentHash: string): Promise<void> => {
    return new Promise((resolve) => {
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/executive-orders/invoice/${paymentHash}`);
          const data = await res.json();
          if (data.paid) {
            clearInterval(pollRef.current!);
            pollRef.current = null;
            resolve();
          }
        } catch {}
      }, 2000);
    });
  }, []);

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

    let invoiceData: { invoice: string; paymentHash: string };
    try {
      const res = await fetch("/api/executive-orders/invoice", { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to create invoice");
      }
      invoiceData = await res.json();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not create payment invoice.";
      setPaymentError(msg);
      setPaymentState("idle");
      return;
    }

    const { invoice, paymentHash } = invoiceData;
    const hasWebLN = typeof window !== "undefined" && "webln" in window;
    const mobile = isMobileDevice();

    if (hasWebLN && !mobile) {
      setPaymentState("awaiting_payment");
      try {
        await window.webln!.enable();
        const result = await window.webln!.sendPayment(invoice);

        setPaymentState("verifying");
        const verifyRes = await fetch("/api/executive-orders/verify-preimage", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ preimage: result.preimage, invoice }),
        });
        const { paid } = await verifyRes.json();
        if (paid) {
          setPaymentState("paid");
          await generateOrder();
        } else {
          setPaymentError("Payment could not be verified. Please try again.");
          setPaymentState("idle");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.toLowerCase().includes("cancel") || msg.toLowerCase().includes("abort")) {
          setPaymentState("idle");
        } else {
          setPaymentError("Payment failed. Please try again.");
          setPaymentState("idle");
        }
      }
    } else {
      setPaymentState("awaiting_payment");
      window.open(`lightning:${invoice}`, "_self");
      await pollForPayment(paymentHash);
      setPaymentState("paid");
      await generateOrder();
    }
  };

  const cancelPayment = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
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
