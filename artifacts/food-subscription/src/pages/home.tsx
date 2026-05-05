import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Utensils, Clock, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 w-full">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-primary/5 overflow-hidden">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold font-serif text-foreground mb-6 leading-tight">
              Real food, <br className="hidden md:block"/> delivered daily.
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Skip the groceries. Skip the cooking. Get warm, wholesome meals delivered to your door every single day.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="text-lg px-8 h-14">
                <Link href="/subscription">See Plans <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 h-14 bg-white border-primary/20 text-primary hover:bg-primary/5 hover:text-primary">
                <Link href="/menu">Browse Menu</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-primary/10 rounded-full absolute inset-0 -translate-x-4 translate-y-4 -z-10 blur-3xl opacity-50"></div>
            <div className="aspect-[4/3] rounded-2xl bg-secondary/50 border border-primary/10 overflow-hidden shadow-2xl flex items-center justify-center">
              <span className="text-muted-foreground font-serif italic text-lg">Delicious food illustration</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg">We handle the sourcing, cooking, and delivery. You just eat.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl shadow-sm border text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Utensils className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-serif mb-3">1. Pick a plan</h3>
              <p className="text-muted-foreground">Choose from our flexible subscription plans. Veg, non-veg, one meal or two.</p>
            </div>
            <div className="bg-card p-8 rounded-2xl shadow-sm border text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-serif mb-3">2. We cook with care</h3>
              <p className="text-muted-foreground">Our chefs prepare your meals daily using fresh, local ingredients.</p>
            </div>
            <div className="bg-card p-8 rounded-2xl shadow-sm border text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-serif mb-3">3. Delivered fresh</h3>
              <p className="text-muted-foreground">Your meals arrive in insulated packaging, still warm and ready to enjoy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold font-serif mb-6">Hungry yet?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join hundreds of happy neighbors who have already reclaimed their evenings.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 h-14 bg-white text-primary hover:bg-white/90">
            <Link href="/subscription">Subscribe Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
