import { useState } from "react";
import { useGenerateExecutiveOrder } from "@workspace/api-client-react";
import type { GenerateOrderRequestPresident, GenerateOrderResponse } from "@workspace/api-client-react/src/generated/api.schemas";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

export type FlowStep = "SELECT_PRESIDENT" | "WRITE_DILEMMA" | "GENERATING" | "RESULT";

export function useOrderFlow() {
  const [step, setStep] = useState<FlowStep>("SELECT_PRESIDENT");
  const [selectedPresident, setSelectedPresident] = useState<GenerateOrderRequestPresident | null>(null);
  const [dilemma, setDilemma] = useState("");
  const [result, setResult] = useState<GenerateOrderResponse | null>(null);
  
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

    setStep("GENERATING");

    try {
      const response = await generateMutation.mutateAsync({
        data: {
          president: selectedPresident,
          dilemma: dilemma.trim()
        }
      });
      
      setResult(response);
      setStep("RESULT");
      
      // Delay confetti slightly for dramatic effect
      setTimeout(fireConfetti, 500);
      
    } catch (error) {
      toast({
        title: "Bureaucratic Error",
        description: "The Oval Office could not process your request at this time.",
        variant: "destructive"
      });
      setStep("WRITE_DILEMMA");
    }
  };

  return {
    step,
    selectedPresident,
    dilemma,
    setDilemma,
    result,
    isGenerating: generateMutation.isPending,
    handleSelectPresident,
    handleBack,
    submitDilemma,
    reset: handleBack
  };
}
