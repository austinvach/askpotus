import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useGenerateExecutiveOrder } from "@workspace/api-client-react";
import type { GenerateOrderRequestPresident, GenerateOrderResponse } from "@workspace/api-client-react/src/generated/api.schemas";
import { useToast } from "@/hooks/use-toast";
import { LN } from "@getalby/sdk";
import { LightningAddress } from "@getalby/lightning-tools";
import confetti from "canvas-confetti";

export type FlowStep = "SELECT_PRESIDENT" | "WRITE_DILEMMA" | "GENERATING" | "RESULT";
export type PaymentState = "idle" | "creating_invoice" | "paying" | "paid";

const LIGHTNING_ADDRESS = "austinvach@cash.app";

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
      const lnAddress = new LightningAddress(LIGHTNING_ADDRESS);
      await lnAddress.fetch();
      const invoiceObj = await lnAddress.requestInvoice({ satoshi: 10 });
      console.log("Invoice fetched from", LIGHTNING_ADDRESS);

      setPaymentState("paying");

      const ln = await getLNClient();
      await ln.pay(invoiceObj.paymentRequest);
      console.log("Payment sent to", LIGHTNING_ADDRESS);

      setPaymentState("paid");
      await generateOrder();

    } catch (err: unknown) {
      console.error("Payment error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setPaymentError(msg || "Payment failed.");
      setPaymentState("idle");
    }
  };

  const cancelPayment = () => {
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
