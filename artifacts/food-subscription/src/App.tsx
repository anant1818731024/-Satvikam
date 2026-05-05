import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout/Layout";
import { AdminLayout } from "@/components/layout/AdminLayout";

import Home from "@/pages/home";
import Menu from "@/pages/menu";
import Subscription from "@/pages/subscription";
import Subscribe from "@/pages/subscribe";
import Success from "@/pages/success";

import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminPlans from "@/pages/admin/plans";
import AdminOrders from "@/pages/admin/orders";
import AdminSubscriptions from "@/pages/admin/subscriptions";

const queryClient = new QueryClient();

function AppRouter() {
  return (
    <Switch>
      <Route path="/admin" nest>
        <AdminLayout>
          <Switch>
            <Route path="/" component={AdminDashboard} />
            <Route path="/products" component={AdminProducts} />
            <Route path="/plans" component={AdminPlans} />
            <Route path="/orders" component={AdminOrders} />
            <Route path="/subscriptions" component={AdminSubscriptions} />
            <Route component={NotFound} />
          </Switch>
        </AdminLayout>
      </Route>
      <Route path="/" nest>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/menu" component={Menu} />
            <Route path="/subscription" component={Subscription} />
            <Route path="/subscribe" component={Subscribe} />
            <Route path="/success" component={Success} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
