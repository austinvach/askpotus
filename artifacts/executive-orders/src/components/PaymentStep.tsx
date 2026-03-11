import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, ExternalLink, Loader2, CheckCircle2 } from "lucide-react";

declare global {
  interface Window {
    webln?: {
      enable: () => Promise<void>;
      sendPayment: (invoice: string) => Promise<{ preimage: string }>;
    };
  }
}

interface PaymentStepProps {
  invoice: string;
  paymentHash: string;
  onPaid: () => void;
  onBack: () => void;
}

function isMobileDevice(): boolean {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export function PaymentStep({ invoice, paymentHash, onPaid, onBack }: PaymentStepProps) {
  const [hasWebLN] = useState(() => typeof window !== "undefined" && "webln" in window);
  const [isMobile] = useState(() => isMobileDevice());
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/executive-orders/invoice/${paymentHash}`);
        const data = await res.json();
        if (data.paid) {
          clearInterval(pollRef.current!);
          setPaid(true);
          setTimeout(onPaid, 800);
        }
      } catch {
      }
    }, 2000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [paymentHash, onPaid]);

  const handleWebLN = async () => {
    setPaying(true);
    setPayError(null);
    try {
      await window.webln!.enable();
      await window.webln!.sendPayment(invoice);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.toLowerCase().includes("cancel") && !msg.toLowerCase().includes("abort")) {
        setPayError("Payment failed. Please try again.");
      }
    } finally {
      setPaying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-full max-w-md mx-auto bg-white rounded-3xl p-8 md:p-10 box-shadow-document relative paper-texture overflow-hidden"
    >
      <button
        onClick={onBack}
        disabled={paying || paid}
        className="absolute top-6 left-6 z-10 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm font-semibold tracking-wide disabled:opacity-50"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="paper-content text-center mt-6">
        <div className="flex justify-center mb-4">
          {paid ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <CheckCircle2 className="w-14 h-14 text-green-500" />
            </motion.div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-yellow-400/20 flex items-center justify-center">
              <Zap className="w-7 h-7 text-yellow-500" />
            </div>
          )}
        </div>

        <p className="text-secondary font-bold tracking-widest text-xs uppercase mb-2">
          Presidential Filing Fee
        </p>
        <h2 className="text-2xl md:text-3xl font-display text-primary leading-tight mb-2">
          {paid ? "Payment Received" : "10 Sats Required"}
        </h2>
        <p className="text-muted-foreground font-serif text-sm mb-8">
          {paid
            ? "Drafting your Executive Order…"
            : "The Oval Office charges a small fee to process your petition."}
        </p>

        {!paid && (
          <div className="space-y-3">
            {isMobile ? (
              <a
                href={`lightning:${invoice}`}
                className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 rounded-full font-display font-bold text-lg shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <Zap className="w-5 h-5" />
                Pay 10 sats
              </a>
            ) : hasWebLN ? (
              <button
                onClick={handleWebLN}
                disabled={paying}
                className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 rounded-full font-display font-bold text-lg shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
              >
                {paying ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Zap className="w-5 h-5" />
                )}
                {paying ? "Awaiting payment…" : "Pay 10 sats"}
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground font-serif">
                  No Lightning wallet detected. Install the Alby browser extension to pay.
                </p>
                <a
                  href="https://getalby.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary/30 text-primary rounded-full font-semibold text-sm hover:border-primary/60 transition-colors"
                >
                  Get Alby Wallet
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {payError && (
              <p className="text-sm text-destructive font-serif">{payError}</p>
            )}

            <p className="text-xs text-muted-foreground/60 font-serif pt-2">
              Waiting for payment
              <span className="inline-flex gap-0.5 ml-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  >
                    .
                  </motion.span>
                ))}
              </span>
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
