import { useState } from "react";
import { useListOrders, useUpdateOrder, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/format";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "subscription" | "single_item">("all");

  const orderParams = {
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(typeFilter !== "all" ? { type: typeFilter } : {}),
  };

  const { data: orders, isLoading } = useListOrders(orderParams);

  const updateOrder = useUpdateOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleMarkPaid = async (id: number) => {
    try {
      await updateOrder.mutateAsync({
        id,
        data: { status: "paid", paymentId: `MANUAL-${Math.floor(Math.random() * 10000)}` }
      });
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      toast({ title: "Order marked as paid" });
    } catch {
      toast({ title: "Error", description: "Failed to update order", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">Track and manage all customer orders.</p>
        </div>

        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <Select value={typeFilter} onValueChange={(val: any) => setTypeFilter(val)}>
            <SelectTrigger className="w-36 sm:w-44">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
              <SelectItem value="single_item">Single Item</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
            <SelectTrigger className="w-32 sm:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-xl bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Order ID</TableHead>
                <TableHead className="whitespace-nowrap">Date</TableHead>
                <TableHead className="whitespace-nowrap">Customer</TableHead>
                <TableHead className="whitespace-nowrap">Item</TableHead>
                <TableHead className="whitespace-nowrap">Type</TableHead>
                <TableHead className="whitespace-nowrap">Amount</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">Delivery</TableHead>
                <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">Loading orders...</TableCell>
                </TableRow>
              ) : orders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No orders found.</TableCell>
                </TableRow>
              ) : (
                orders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs whitespace-nowrap">{order.orderId}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{format(new Date(order.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="font-medium whitespace-nowrap">{order.userName || `User #${order.userId}`}</TableCell>
                    <TableCell className="text-sm max-w-[140px] truncate">
                      {order.type === "single_item"
                        ? (order.productName || `Item #${order.productId}`)
                        : (order.planName || `Plan #${order.planId}`)
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize whitespace-nowrap">
                        {order.type === "single_item" ? "Single" : "Sub"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono whitespace-nowrap">{formatCurrency(order.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === "paid" ? "default" : "secondary"} className={order.status === "paid" ? "bg-accent hover:bg-accent/80 text-accent-foreground whitespace-nowrap" : "whitespace-nowrap"}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.deliveryStatus === "delivered" ? "default" : "outline"} className={order.deliveryStatus === "delivered" ? "bg-green-600 text-white whitespace-nowrap" : "text-amber-600 border-amber-300 whitespace-nowrap"}>
                        {order.deliveryStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {order.status === "pending" && (
                        <Button variant="outline" size="sm" onClick={() => handleMarkPaid(order.id)} disabled={updateOrder.isPending} className="whitespace-nowrap">
                          Mark Paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
