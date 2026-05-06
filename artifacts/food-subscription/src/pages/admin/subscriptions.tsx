import { useState } from "react";
import { useListSubscriptions } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminSubscriptions() {
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
  const { data: subscriptions, isLoading } = useListSubscriptions({ status: activeTab });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-serif text-foreground">Subscriptions</h1>
        <p className="text-muted-foreground mt-1">View active and past meal subscriptions.</p>
      </div>

      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Subscriptions</TabsTrigger>
          <TabsTrigger value="inactive">Past / Inactive</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <div className="border rounded-xl bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order Ref</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Loading subscriptions...</TableCell>
                  </TableRow>
                ) : subscriptions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No {activeTab} subscriptions found.</TableCell>
                  </TableRow>
                ) : (
                  subscriptions?.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.userName || `User #${sub.userId}`}</TableCell>
                      <TableCell>{sub.planName || `Plan #${sub.planId}`}</TableCell>
                      <TableCell className="text-sm">{format(new Date(sub.startDate), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-sm">{format(new Date(sub.endDate), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant={sub.status === "active" ? "default" : "secondary"} className={sub.status === "active" ? "bg-accent hover:bg-accent/80 text-accent-foreground" : ""}>
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{sub.orderId}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
