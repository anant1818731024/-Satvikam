import { useListProducts } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Coffee, Utensils } from "lucide-react";

export default function Menu() {
  const { data: products, isLoading, error } = useListProducts();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mb-12">
        <h1 className="text-4xl font-bold font-serif mb-4">Our Menu</h1>
        <p className="text-xl text-muted-foreground">
          A glimpse into the kinds of wholesome, nourishing meals you'll receive. Our actual menu rotates daily based on what's fresh.
        </p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="border rounded-2xl p-6 bg-card">
              <Skeleton className="h-6 w-2/3 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-4/5 mb-6" />
              <div className="flex justify-between items-center mt-auto">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-destructive/10 text-destructive rounded-2xl border border-destructive/20">
          <p>Failed to load the menu. Please try again later.</p>
        </div>
      ) : products?.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-2xl border">
          <Utensils className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-serif mb-2">Check back soon</h2>
          <p className="text-muted-foreground">We're updating our menu right now.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map(product => (
            <div key={product.id} className="border rounded-2xl p-6 bg-card hover:shadow-md transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold font-serif">{product.name}</h3>
                <Badge variant={product.type === "veg" ? "default" : "destructive"} className="uppercase tracking-wider text-[10px]">
                  {product.type}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-6 flex-1 text-sm">
                {product.description || "A delicious, freshly prepared meal."}
              </p>
              <div className="font-mono text-lg font-bold text-primary">
                {formatCurrency(product.price)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
