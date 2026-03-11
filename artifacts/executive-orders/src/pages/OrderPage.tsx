import React from 'react';
import { useParams, Link } from 'wouter';
import { useGetExecutiveOrder } from '@workspace/api-client-react';
import { DocumentResult } from '@/components/DocumentResult';
import { Header } from '@/components/Header';
import { motion } from 'framer-motion';

export default function OrderPage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? '';

  const { data: order, isLoading, isError } = useGetExecutiveOrder(id, {
    query: { enabled: !!id }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
        </div>
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center"
          >
            <div className="text-6xl mb-6">🦅</div>
            <p className="font-display text-xl text-primary tracking-widest uppercase">
              Retrieving from the Archives...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
        </div>
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">🏛️</div>
            <h2 className="font-display text-2xl font-bold text-primary mb-4">
              Order Not Found
            </h2>
            <p className="font-serif text-muted-foreground mb-8">
              This executive order may have been classified, redacted, or never issued.
            </p>
            <Link href="/">
              <a className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-display font-bold hover:bg-primary/90 transition-all duration-300">
                Issue a New Order
              </a>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
      </div>

      <div className="flex-1 relative z-10 flex flex-col pt-4 md:pt-8">
        <Header />
        <main className="flex-1 w-full pb-16 pt-8 flex flex-col items-center">
          <DocumentResult result={order} isSharedView={true} />
        </main>
      </div>

      <footer className="w-full py-6 text-center text-muted-foreground/60 font-serif text-sm relative z-10">
        <p>For entertainment purposes only. Not legally binding in any jurisdiction.</p>
      </footer>
    </div>
  );
}
