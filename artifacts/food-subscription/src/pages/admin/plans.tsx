import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListPlans, useCreatePlan, useUpdatePlan, useDeletePlan, getListPlansQueryKey } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPlans() {
  const { data: plans, isLoading } = useListPlans();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    mealsPerDay: "",
    durationDays: "",
    description: "",
  });

  const resetForm = () => {
    setFormData({ name: "", price: "", mealsPerDay: "", durationDays: "", description: "" });
    setEditingId(null);
  };

  const handleEdit = (plan: any) => {
    setFormData({
      name: plan.name,
      price: (plan.price / 100).toString(),
      mealsPerDay: plan.mealsPerDay.toString(),
      durationDays: plan.durationDays.toString(),
      description: plan.description || "",
    });
    setEditingId(plan.id);
    setIsCreateOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      await deletePlan.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListPlansQueryKey() });
      toast({ title: "Plan deleted" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete plan", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        price: Math.round(parseFloat(formData.price) * 100),
        mealsPerDay: parseInt(formData.mealsPerDay, 10),
        durationDays: parseInt(formData.durationDays, 10),
        description: formData.description,
      };

      if (editingId) {
        await updatePlan.mutateAsync({ id: editingId, data: payload });
        toast({ title: "Plan updated" });
      } else {
        await createPlan.mutateAsync({ data: payload });
        toast({ title: "Plan created" });
      }

      queryClient.invalidateQueries({ queryKey: getListPlansQueryKey() });
      setIsCreateOpen(false);
      resetForm();
    } catch (err) {
      toast({ title: "Error", description: "Failed to save plan", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-foreground">Subscription Plans</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage the subscription packages offered to customers.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="shrink-0"><Plus className="w-4 h-4 mr-2" /> Add Plan</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Plan" : "Add New Plan"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Standard Monthly" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (INR)</label>
                  <Input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="3000.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (Days)</label>
                  <Input type="number" required value={formData.durationDays} onChange={e => setFormData({...formData, durationDays: e.target.value})} placeholder="30" />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Meals Per Day</label>
                  <Input type="number" required value={formData.mealsPerDay} onChange={e => setFormData({...formData, mealsPerDay: e.target.value})} placeholder="2" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Brief description..." rows={2} />
              </div>

              <Button type="submit" className="w-full" disabled={createPlan.isPending || updatePlan.isPending}>
                {(createPlan.isPending || updatePlan.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingId ? "Update" : "Save"} Plan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-xl bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="whitespace-nowrap">Price</TableHead>
                <TableHead className="whitespace-nowrap hidden sm:table-cell">Duration</TableHead>
                <TableHead className="whitespace-nowrap hidden sm:table-cell">Meals/Day</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading plans...</TableCell>
                </TableRow>
              ) : plans?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No plans found.</TableCell>
                </TableRow>
              ) : (
                plans?.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell className="font-mono whitespace-nowrap">{formatCurrency(plan.price)}</TableCell>
                    <TableCell className="whitespace-nowrap hidden sm:table-cell">{plan.durationDays} days</TableCell>
                    <TableCell className="hidden sm:table-cell">{plan.mealsPerDay}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(plan.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
