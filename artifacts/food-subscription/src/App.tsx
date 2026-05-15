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
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Account from "@/pages/account";
import Support from "@/pages/support";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";

import AdminLogin from "@/pages/admin/login";
import AdminForgotPassword from "@/pages/admin/forgot-password";
import AdminResetPassword from "@/pages/admin/reset-password";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminPlans from "@/pages/admin/plans";
import AdminOrders from "@/pages/admin/orders";
import AdminSubscriptions from "@/pages/admin/subscriptions";
import AdminDelivery from "@/pages/admin/delivery";
import AdminSecurity from "@/pages/admin/security";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <AdminLayout>
      <Component />
    </AdminLayout>
  );
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/forgot-password" component={AdminForgotPassword} />
      <Route path="/admin/reset-password" component={AdminResetPassword} />
      <Route path="/admin/products">{() => <AdminRoute component={AdminProducts} />}</Route>
      <Route path="/admin/plans">{() => <AdminRoute component={AdminPlans} />}</Route>
      <Route path="/admin/orders">{() => <AdminRoute component={AdminOrders} />}</Route>
      <Route path="/admin/subscriptions">{() => <AdminRoute component={AdminSubscriptions} />}</Route>
      <Route path="/admin/delivery">{() => <AdminRoute component={AdminDelivery} />}</Route>
      <Route path="/admin/security">{() => <AdminRoute component={AdminSecurity} />}</Route>
      <Route path="/admin">{() => <AdminRoute component={AdminDashboard} />}</Route>

      <Route path="/" nest>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/menu" component={Menu} />
            <Route path="/subscription" component={Subscription} />
            <Route path="/subscribe" component={Subscribe} />
            <Route path="/success" component={Success} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
            <Route path="/account" component={Account} />
            <Route path="/support" component={Support} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/reset-password" component={ResetPassword} />
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
