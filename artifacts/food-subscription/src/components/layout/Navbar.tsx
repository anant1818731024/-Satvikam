import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();

  const navLinks = [
    { href: "/menu", label: "Menu" },
    { href: "/subscription", label: "Plans" },
  ];

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
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Button asChild className="font-semibold shadow-sm">
          <Link href="/subscription">Subscribe</Link>
        </Button>
      </div>
    </header>
  );
}
