import { Link } from "wouter";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f5f0eb]">
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }} className="h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
      <div className="flex-1 flex items-center justify-center pt-4">
        <div className="text-center space-y-4 px-4">
          <h1 className="text-4xl font-serif font-bold text-[#1a3a5c]">
            404
          </h1>
          <p className="text-muted-foreground font-serif">
            This executive order has been rescinded.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-sm font-serif underline underline-offset-2 text-[#1a3a5c] hover:text-[#1a3a5c]/70 transition-colors"
          >
            Return to the Oval Office
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
