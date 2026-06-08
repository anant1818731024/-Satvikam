import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SaffronLogo } from "@/components/brand/SaffronLogo";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4 text-center">
          <SaffronLogo size="lg" className="justify-center mb-6" />
          <p className="font-serif text-2xl mb-4">Saffron.</p>
          <p className="text-background/60 text-sm max-w-md mx-auto">
            Warm, wholesome meals delivered to your door. Because good food shouldn't be hard to find.
          </p>
        </div>
      </footer>
      <WhatsAppButton />
    </div>
  );
}
