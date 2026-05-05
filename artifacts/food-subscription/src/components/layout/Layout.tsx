import { ReactNode } from "react";
import { Navbar } from "./Navbar";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="w-12 h-12 bg-background text-foreground rounded-full flex items-center justify-center font-bold font-serif text-2xl mx-auto mb-6">
            S
          </div>
          <p className="font-serif text-2xl mb-4">Saffron.</p>
          <p className="text-background/60 text-sm max-w-md mx-auto">
            Warm, wholesome meals delivered to your door. Because good food shouldn't be hard to find.
          </p>
        </div>
      </footer>
    </div>
  );
}
