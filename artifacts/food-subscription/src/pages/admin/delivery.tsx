import { useState } from "react";
import { useListOrders, useUpdateOrder, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { Truck, CheckCircle2, Package } from "lucide-react";

export default function AdminDelivery() {
  const [activeTab, setActiveTab] = useState<"pending" | "delivered">("pending");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: orders, isLoading } = useListOrders({
    status: "paid",
    deliveryStatus: activeTab,
  });

  const updateOrder = useUpdateOrder();

  const handleMarkDelivered = async (id: number) => {
    try {
      await updateOrder.mutateAsync({ id, data: { deliveryStatus: "delivered" } });
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      toast({ title: "Marked as delivered" });
    } catch {
      toast({ title: "Error", description: "Failed to update delivery status", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-serif text-foreground">Delivery</h1>
        <p className="text-muted-foreground mt-1">Manage order deliveries and track status.</p>
      </div>

      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Package className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pending</span> Deliveries
          </TabsTrigger>
          <TabsTrigger value="delivered" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Already</span> Delivered
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
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
                    {activeTab === "pending" && (
                      <TableHead className="text-right whitespace-nowrap">Action</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={activeTab === "pending" ? 8 : 7} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : orders?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={activeTab === "pending" ? 8 : 7} className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          {activeTab === "pending" ? (
                            <>
                              <Truck className="w-8 h-8 opacity-30" />
                              <p>No pending deliveries</p>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-8 h-8 opacity-30" />
                              <p>No deliveries completed yet</p>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders?.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs whitespace-nowrap">{order.orderId}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{format(new Date(order.createdAt), "MMM d, yyyy")}</TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{order.userName || `User #${order.userId}`}</TableCell>
                        <TableCell className="text-sm max-w-[130px] truncate">
                          {order.type === "single_item"
                            ? (order.productName || `Item #${order.productId}`)
                            : (order.planName || `Plan #${order.planId}`)
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {order.type === "single_item" ? "Single" : "Sub"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono whitespace-nowrap">{formatCurrency(order.amount)}</TableCell>
                        <TableCell>
                          <Badge
                            className={activeTab === "delivered" ? "bg-green-600 text-white whitespace-nowrap" : "bg-amber-100 text-amber-700 border-amber-200 whitespace-nowrap"}
                            variant="outline"
                          >
                            {activeTab === "delivered" ? "Delivered" : "Pending"}
                          </Badge>
                        </TableCell>
                        {activeTab === "pending" && (
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => handleMarkDelivered(order.id)}
                              disabled={updateOrder.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                            >
                              <Truck className="w-3 h-3 mr-1.5" />
                              <span className="hidden sm:inline">Mark </span>Delivered
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
