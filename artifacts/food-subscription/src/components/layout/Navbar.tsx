import { Link, useLocation } from "wouter";
import { Coffee, Utensils, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold font-serif text-lg">
            S
          </div>
          <span className="font-serif font-bold text-xl text-foreground">Saffron.</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/menu"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location === "/menu" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Menu
          </Link>
          <Link
            href="/subscription"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location === "/subscription" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Plans
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" className="hidden sm:inline-flex border-primary/20 text-primary hover:bg-primary/5 hover:text-primary">
            <Link href="/admin">Admin</Link>
          </Button>
          <Button asChild className="font-semibold shadow-sm">
            <Link href="/subscription">Subscribe</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
