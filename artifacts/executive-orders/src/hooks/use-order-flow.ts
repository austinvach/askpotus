import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useGenerateExecutiveOrder } from "@workspace/api-client-react";
import type { GenerateOrderRequestPresident, GenerateOrderResponse } from "@workspace/api-client-react/src/generated/api.schemas";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

export type FlowStep = "SELECT_PRESIDENT" | "WRITE_DILEMMA" | "GENERATING" | "RESULT";
export type PaymentState = "idle" | "creating_invoice" | "paying" | "paid";

export function useOrderFlow() {
  const [step, setStep] = useState<FlowStep>("SELECT_PRESIDENT");
  const [selectedPresident, setSelectedPresident] = useState<GenerateOrderRequestPresident | null>(null);
  const [dilemma, setDilemma] = useState("");
  const [result, setResult] = useState<GenerateOrderResponse | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);
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

  const submitDilemma = useCallback(async () => {
    if (!selectedPresident || !dilemma.trim()) {
      toast({
        title: "Incomplete Request",
        description: "Please specify your dilemma for the Commander in Chief.",
        variant: "destructive"
      });
      return;
    }

    setPaymentError(null);
    setPaymentState("paying");
    setStep("GENERATING");

    try {
      const response = await generateMutation.mutateAsync({
        data: {
          president: selectedPresident,
          dilemma: dilemma.trim()
        }
      });
      setPaymentState("paid");
      setResult(response);
      setStep("RESULT");
      navigate(`/order/${response.id}`);
      setTimeout(fireConfetti, 500);
    } catch (err: unknown) {
      console.error("Order error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setPaymentError(msg || "The Oval Office could not process your request.");
      setPaymentState("idle");
      setStep("WRITE_DILEMMA");
      toast({
        title: "Bureaucratic Error",
        description: "The Oval Office could not process your request at this time.",
        variant: "destructive"
      });
    }
  }, [selectedPresident, dilemma, generateMutation, navigate, toast]);

  const cancelPayment = () => {
    setPaymentState("idle");
    setPaymentError(null);
    setStep("WRITE_DILEMMA");
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
