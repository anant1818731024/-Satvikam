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
  
  const queryParams = statusFilter === "all" ? {} : { status: statusFilter };
  const { data: orders, isLoading } = useListOrders({ query: queryParams });
  
  const updateOrder = useUpdateOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleMarkPaid = async (id: number) => {
    try {
      await updateOrder.mutateAsync({ 
        id, 
        data: { status: "paid", paymentId: `MANUAL-${Math.floor(Math.random()*10000)}` } 
      });
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      toast({ title: "Order marked as paid" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update order", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">Track and manage customer payments and orders.</p>
        </div>
        
        <div className="w-48">
          <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-xl bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">Loading orders...</TableCell>
              </TableRow>
            ) : orders?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No orders found.</TableCell>
              </TableRow>
            ) : (
              orders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.orderId}</TableCell>
                  <TableCell className="text-sm">{format(new Date(order.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell className="font-medium">{order.userName || `User #${order.userId}`}</TableCell>
                  <TableCell>{order.planName || `Plan #${order.planId}`}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(order.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === "paid" ? "default" : "secondary"} className={order.status === "paid" ? "bg-accent hover:bg-accent/80 text-accent-foreground" : ""}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {order.status === "pending" && (
                      <Button variant="outline" size="sm" onClick={() => handleMarkPaid(order.id)} disabled={updateOrder.isPending}>
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
  );
}
