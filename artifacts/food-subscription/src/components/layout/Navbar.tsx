import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useUserLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { User, LogOut, HelpCircle, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SaffronLogo } from "@/components/brand/SaffronLogo";

export function Navbar() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const queryClient = useQueryClient();
  const logout = useUserLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

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
        {/* Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden -ml-2"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <Link href="/">
            <SaffronLogo showWordmark />
          </Link>
        </div>

        {/* Desktop nav */}
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

        {/* Right side auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!isLoading && (
            isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline max-w-24 truncate text-sm">{user.name.split(" ")[0]}</span>
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
                <Button variant="ghost" asChild className="text-sm hidden sm:inline-flex">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="font-semibold shadow-sm text-sm">
                  <Link href="/subscription">Subscribe</Link>
                </Button>
              </>
            )
          )}
        </div>
      </div>

      {/* Mobile nav Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 pt-0">
          <div className="flex items-center h-16 border-b mb-4">
            <SaffronLogo showWordmark />
          </div>
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center px-3 py-3 rounded-md text-base font-medium transition-colors hover:text-primary hover:bg-accent ${
                  location === link.href ? "text-primary bg-accent" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-3 py-3 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
              >
                Sign In
              </Link>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
