import { useState } from "react";
import { useLocation } from "wouter";
import { useGenerateExecutiveOrder } from "@workspace/api-client-react";
import type { GenerateOrderRequestPresident, GenerateOrderResponse } from "@workspace/api-client-react/src/generated/api.schemas";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

export type FlowStep = "SELECT_PRESIDENT" | "WRITE_DILEMMA" | "PAYMENT" | "GENERATING" | "RESULT";

export function useOrderFlow() {
  const [step, setStep] = useState<FlowStep>("SELECT_PRESIDENT");
  const [selectedPresident, setSelectedPresident] = useState<GenerateOrderRequestPresident | null>(null);
  const [dilemma, setDilemma] = useState("");
  const [result, setResult] = useState<GenerateOrderResponse | null>(null);
  const [invoice, setInvoice] = useState<string | null>(null);
  const [paymentHash, setPaymentHash] = useState<string | null>(null);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
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
    } else if (step === "PAYMENT") {
      setStep("WRITE_DILEMMA");
      setInvoice(null);
      setPaymentHash(null);
    } else if (step === "RESULT") {
      setStep("SELECT_PRESIDENT");
      setSelectedPresident(null);
      setDilemma("");
      setResult(null);
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

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const submitDilemma = async () => {
    if (!selectedPresident || !dilemma.trim()) {
      toast({
        title: "Incomplete Request",
        description: "Please specify your dilemma for the Commander in Chief.",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingInvoice(true);
    try {
      const res = await fetch("/api/executive-orders/invoice", { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to create invoice");
      }
      const data = await res.json();
      setInvoice(data.invoice);
      setPaymentHash(data.paymentHash);
      setStep("PAYMENT");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not create payment invoice.";
      toast({
        title: "Payment Setup Failed",
        description: msg,
        variant: "destructive"
      });
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const onPaymentConfirmed = async () => {
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
      setStep("PAYMENT");
    }
  };

  return {
    step,
    selectedPresident,
    dilemma,
    setDilemma,
    result,
    invoice,
    paymentHash,
    isGenerating: generateMutation.isPending,
    isCreatingInvoice,
    handleSelectPresident,
    handleBack,
    submitDilemma,
    onPaymentConfirmed,
    reset: handleBack
  };
}
