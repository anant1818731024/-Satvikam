import { useGetAdminSummary } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IndianRupee, Users, PackageOpen, CheckCircle, Truck } from "lucide-react";

export default function AdminDashboard() {
  const { data: summary, isLoading, error } = useGetAdminSummary();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-serif">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="text-center py-12 text-destructive">
        <p>Failed to load dashboard data.</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(summary.totalRevenue),
      icon: IndianRupee,
      description: "All time revenue from paid orders",
    },
    {
      title: "Active Subscriptions",
      value: summary.activeSubscriptions.toString(),
      icon: CheckCircle,
      description: "Currently ongoing meal plans",
    },
    {
      title: "Pending Orders",
      value: summary.pendingOrders.toString(),
      icon: PackageOpen,
      description: "Orders awaiting payment",
    },
    {
      title: "Pending Deliveries",
      value: summary.pendingDeliveries.toString(),
      icon: Truck,
      description: "Paid orders awaiting delivery",
    },
    {
      title: "Total Customers",
      value: summary.totalUsers.toString(),
      icon: Users,
      description: "Registered users in the system",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-serif text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your subscription business.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-sidebar-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
