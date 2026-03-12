import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f5f0eb]">
      <Header progress={1} />
      <div className="flex-1 flex items-center justify-center">
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
