import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { GenerateOrderRequestPresident } from "@workspace/api-client-react/src/generated/api.schemas";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { PaymentState } from "@/hooks/use-order-flow";

const PLACEHOLDER_SUGGESTIONS = [
  "Should I eat a pizza or salad tonight?",
  "Should I quit my job and start vibe coding full-time?",
  "Is a hot dog a sandwich?",
];

interface DilemmaFormProps {
  president: GenerateOrderRequestPresident;
  dilemma: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  onCancelPayment: () => void;
  paymentState: PaymentState;
  paymentError: string | null;
}

const PRESIDENT_LAST_NAMES: Record<GenerateOrderRequestPresident, string> = {
  [GenerateOrderRequestPresident.george_w_bush]: "Bush",
  [GenerateOrderRequestPresident.obama]: "Obama",
  [GenerateOrderRequestPresident.trump]: "Trump",
  [GenerateOrderRequestPresident.biden]: "Biden",
};

function getButtonContent(paymentState: PaymentState) {
  switch (paymentState) {
    case "creating_invoice":
      return "Preparing...";
    case "paying":
      return "Processing Payment...";
    case "paid":
      return "Payment Confirmed!";
    default:
      return "REQUEST EXECUTIVE ORDER";
  }
}

export function DilemmaForm({
  president,
  dilemma,
  onChange,
  onSubmit,
  onBack,
  onCancelPayment,
  paymentState,
  paymentError,
}: DilemmaFormProps) {
  const lastName = PRESIDENT_LAST_NAMES[president];
  const busy = paymentState !== "idle";
  const text = getButtonContent(paymentState);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSuggestionIndex((i) => (i + 1) % PLACEHOLDER_SUGGESTIONS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl p-8 md:p-12 box-shadow-document relative paper-texture overflow-hidden">
      <button
        onClick={busy ? onCancelPayment : onBack}
        disabled={paymentState === "paid"}
        className="absolute top-6 left-6 md:top-8 md:left-8 z-10 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm font-semibold tracking-wide disabled:opacity-50"
      >
        <ArrowLeft className="w-4 h-4" />
        {busy ? "Cancel" : "Back"}
      </button>

      <div className="paper-content">
        <div className="text-center mt-8 mb-10">
          <p className="text-secondary font-bold tracking-widest text-xs uppercase mb-3">
            Petition to the Oval Office
          </p>
          <h2 className="text-3xl md:text-4xl font-display text-primary leading-tight">
            What Requires the Attention of President {lastName}?
          </h2>
        </div>

        <div className="space-y-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
            <motion.div
              key={`placeholder-fade-${suggestionIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 pointer-events-none"
            />
            <Textarea
              ref={textareaRef}
              value={dilemma}
              onChange={(e) => { onChange(e.target.value); autoResize(); }}
              placeholder={PLACEHOLDER_SUGGESTIONS[suggestionIndex]}
              className="relative w-full text-lg md:text-xl font-serif p-6 bg-background/50 border-2 border-border rounded-xl focus-visible:ring-accent focus-visible:border-accent transition-all resize-none shadow-inner placeholder:text-muted-foreground/30 overflow-hidden"
              rows={1}
              disabled={busy}
            />
          </div>

          <div className="flex flex-col items-center gap-3 pt-4">
            <button
              onClick={onSubmit}
              disabled={!dilemma.trim() || busy}
              className="relative overflow-hidden group px-10 py-5 bg-primary text-white rounded-full font-display font-bold text-lg md:text-xl shadow-[0_10px_20px_-10px_rgba(10,49,97,0.5)] hover:shadow-[0_20px_25px_-5px_rgba(10,49,97,0.4)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none disabled:transform-none"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="relative z-10">{text}</span>
            </button>

            {paymentError && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive font-serif text-center"
              >
                {paymentError}
              </motion.p>
            )}

            <p className="text-xs text-muted-foreground/50 font-serif flex items-center gap-1.5">
              ₿100 filing fee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
