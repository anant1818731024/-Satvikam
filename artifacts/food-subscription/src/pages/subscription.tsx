import { Link } from "wouter";
import { useListPlans } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Calendar } from "lucide-react";

export default function Subscription() {
  const { data: plans, isLoading, error } = useListPlans();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold font-serif mb-4">Choose your plan</h1>
        <p className="text-xl text-muted-foreground">
          Simple, honest pricing. No hidden fees. Cancel or pause anytime.
        </p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-3xl p-8 bg-card">
              <Skeleton className="h-8 w-2/3 mb-4" />
              <Skeleton className="h-12 w-1/2 mb-8" />
              <div className="space-y-4 mb-8">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 max-w-2xl mx-auto">
          <p>Failed to load subscription plans. Please try again later.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans?.map((plan, i) => (
            <div 
              key={plan.id} 
              className={`border rounded-3xl p-8 flex flex-col ${
                i === 1 ? "bg-primary text-primary-foreground border-primary shadow-xl scale-105" : "bg-card hover:border-primary/50 transition-colors"
              }`}
            >
              <h3 className={`text-2xl font-bold font-serif mb-2 ${i === 1 ? "text-primary-foreground" : ""}`}>{plan.name}</h3>
              <p className={`text-sm mb-6 ${i === 1 ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {plan.description || "Perfect for everyday meals."}
              </p>
              
              <div className="mb-8">
                <span className="text-4xl font-bold">{formatCurrency(plan.price)}</span>
                <span className={`text-sm ${i === 1 ? "text-primary-foreground/80" : "text-muted-foreground"}`}>/{plan.durationDays} days</span>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3">
                  <Check className={`w-5 h-5 ${i === 1 ? "text-white" : "text-primary"}`} />
                  <span>{plan.mealsPerDay} meals per day</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className={`w-5 h-5 ${i === 1 ? "text-white" : "text-primary"}`} />
                  <span>{plan.durationDays} days duration</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className={`w-5 h-5 ${i === 1 ? "text-white" : "text-primary"}`} />
                  <span>Free doorstep delivery</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className={`w-5 h-5 ${i === 1 ? "text-white" : "text-primary"}`} />
                  <span>Pause anytime</span>
                </li>
              </ul>
              
              <Button 
                asChild 
                size="lg" 
                variant={i === 1 ? "secondary" : "default"} 
                className={`w-full rounded-xl h-12 text-lg ${
                  i === 1 ? "bg-white text-primary hover:bg-white/90" : ""
                }`}
              >
                <Link href={`/subscribe?plan=${plan.id}`}>Select Plan</Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
