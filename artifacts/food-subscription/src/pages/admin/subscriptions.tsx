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
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-serif text-foreground">Subscriptions</h1>
        <p className="text-muted-foreground mt-1">View active and past meal subscriptions.</p>
      </div>

      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Past / Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="border rounded-xl bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Customer</TableHead>
                    <TableHead className="whitespace-nowrap">Plan</TableHead>
                    <TableHead className="whitespace-nowrap hidden sm:table-cell">Start Date</TableHead>
                    <TableHead className="whitespace-nowrap hidden sm:table-cell">End Date</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="whitespace-nowrap hidden md:table-cell">Order Ref</TableHead>
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
                        <TableCell className="font-medium whitespace-nowrap">{sub.userName || `User #${sub.userId}`}</TableCell>
                        <TableCell className="whitespace-nowrap">{sub.planName || `Plan #${sub.planId}`}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap hidden sm:table-cell">{format(new Date(sub.startDate), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap hidden sm:table-cell">{format(new Date(sub.endDate), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <Badge variant={sub.status === "active" ? "default" : "secondary"} className={sub.status === "active" ? "bg-accent hover:bg-accent/80 text-accent-foreground" : ""}>
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground hidden md:table-cell">{sub.orderId}</TableCell>
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
