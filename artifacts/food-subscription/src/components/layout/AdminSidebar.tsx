import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, Coffee, ShoppingBag, CalendarClock, Home, Truck, LogOut, Shield } from "lucide-react";
import { useAdminLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/plans", label: "Plans", icon: Coffee },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CalendarClock },
  { href: "/admin/delivery", label: "Delivery", icon: Truck },
  { href: "/admin/security", label: "Security", icon: Shield },
];

export function AdminSidebar() {
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const logout = useAdminLogout();

  const handleLogout = async () => {
    await logout.mutateAsync();
    queryClient.clear();
    navigate("/admin/login");
  };

  return (
    <aside className="w-64 border-r bg-sidebar h-[100dvh] flex flex-col sticky top-0">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold font-serif text-lg">
            S
          </div>
          <span className="font-serif font-bold text-xl text-sidebar-foreground">Saffron.</span>
        </div>
        <p className="text-xs text-sidebar-foreground/60 font-medium">Administration</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {links.map((link) => {
          const active = location === link.href || (link.href !== "/admin" && location.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
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
    </aside>
  );
}
