import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useUserLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { User, LogOut, HelpCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const queryClient = useQueryClient();
  const logout = useUserLogout();

  const navLinks = [
    { href: "/menu", label: "Menu" },
    { href: "/subscription", label: "Plans" },
    { href: "/support", label: "Help" },
  ];

  const handleLogout = async () => {
    await logout.mutateAsync();
    queryClient.invalidateQueries();
    navigate("/");
  };

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

        <div className="flex items-center gap-3">
          {!isLoading && (
            isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-24 truncate text-sm">{user.name.split(" ")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" /> My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/support" className="flex items-center gap-2 cursor-pointer">
                      <HelpCircle className="w-4 h-4" /> Help & Support
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-sm">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="font-semibold shadow-sm">
                  <Link href="/subscription">Subscribe</Link>
                </Button>
              </>
            )
          )}
        </div>
      </div>
    </header>
  );
}
