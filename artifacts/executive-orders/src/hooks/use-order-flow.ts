import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useGenerateExecutiveOrder, useCreateInvoice } from "@workspace/api-client-react";
import type { GenerateOrderRequestPresident, GenerateOrderResponse } from "@workspace/api-client-react/src/generated/api.schemas";
import { useToast } from "@/hooks/use-toast";
import { launchPaymentModal, closeModal } from "@getalby/bitcoin-connect-react";
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
  const createInvoiceMutation = useCreateInvoice();

  const handleSelectPresident = (president: GenerateOrderRequestPresident) => {
    setSelectedPresident(president);
    setStep("WRITE_DILEMMA");
  };

  const handleBack = () => {
    if (step === "WRITE_DILEMMA") {
      closeModal();
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
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#0A3161', '#B31942', '#ffffff'] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#0A3161', '#B31942', '#ffffff'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const generateOrder = useCallback(async (preimage: string) => {
    setStep("GENERATING");
    try {
      const response = await generateMutation.mutateAsync({
        data: {
          president: selectedPresident!,
          dilemma: dilemma.trim(),
          preimage,
        }
      });
      setPaymentState("paid");
      setResult(response);
      setStep("RESULT");
      navigate(`/order/${response.id}`);
      setTimeout(fireConfetti, 500);
    } catch (err: unknown) {
      console.error("Order generation error:", err);
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

    let invoice: string;
    let paymentHash: string;

    try {
      const invoiceData = await createInvoiceMutation.mutateAsync({});
      invoice = invoiceData.invoice;
      paymentHash = invoiceData.paymentHash;
    } catch (err) {
      console.error("Invoice error:", err);
      setPaymentError("Could not create payment invoice. Please try again.");
      setPaymentState("idle");
      return;
    }

    setPaymentState("paying");

    launchPaymentModal({
      invoice,
      onPaid: ({ preimage }) => {
        void generateOrder(preimage);
      },
      onCancelled: () => {
        setPaymentState("idle");
        setPaymentError(null);
      },
    });

    void paymentHash; // used server-side for verification via preimage
  };

  const cancelPayment = () => {
    closeModal();
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
