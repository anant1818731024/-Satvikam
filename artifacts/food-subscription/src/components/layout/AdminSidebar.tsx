import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, Coffee, ShoppingBag, CalendarClock, Home, Truck, LogOut, Shield, Settings, Menu } from "lucide-react";
import { useAdminLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SaffronLogo } from "@/components/brand/SaffronLogo";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/plans", label: "Plans", icon: Coffee },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CalendarClock },
  { href: "/admin/delivery", label: "Delivery", icon: Truck },
  { href: "/admin/security", label: "Security", icon: Shield },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function NavItems({ location, onNavigate, handleLogout }: {
  location: string;
  onNavigate?: () => void;
  handleLogout: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-sidebar-border">
        <SaffronLogo showWordmark wordmarkClassName="text-sidebar-foreground" className="mb-2" />
        <p className="text-xs text-sidebar-foreground/60 font-medium">Administration</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {links.map((link) => {
          const active = location === link.href || (link.href !== "/admin" && location.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border space-y-1">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Store
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const queryClient = useQueryClient();
  const logout = useAdminLogout();

  const handleLogout = async () => {
    await logout.mutateAsync();
    queryClient.clear();
    navigate("/admin/login");
  };

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center gap-3 px-4 h-14 border-b bg-sidebar border-sidebar-border shrink-0">
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
          <Menu className="w-5 h-5" />
        </Button>
        <SaffronLogo size="sm" showWordmark wordmarkClassName="text-sidebar-foreground" />
        <span className="text-xs text-sidebar-foreground/60 font-medium">Admin</span>
      </header>

      {/* Mobile Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar">
          <NavItems
            location={location}
            onNavigate={() => setMobileOpen(false)}
            handleLogout={handleLogout}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 border-r bg-sidebar h-[100dvh] sticky top-0 shrink-0">
        <NavItems location={location} handleLogout={handleLogout} />
      </aside>
    </>
  );
}
