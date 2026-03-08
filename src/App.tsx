import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import Auth from "./pages/Auth";
import HomePage from "./pages/Home";
import InvestPage from "./pages/Invest";
import MyTeamPage from "./pages/MyTeam";
import MinePage from "./pages/Mine";
import RechargePage from "./pages/Recharge";
import WithdrawalPage from "./pages/Withdrawal";
import CustomerSupport from "./pages/CustomerSupport";
import ChangePassword from "./pages/ChangePassword";
import ProfileView from "./pages/ProfileView";
import GiftCodePage from "./pages/GiftCode";
import AppPage from "./pages/AppPage";
import AboutUs from "./pages/AboutUs";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminTransactions from "./pages/admin/Transactions";
import AdminGiftCodes from "./pages/admin/GiftCodes";
import AdminSettings from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <div className="text-primary-foreground text-lg font-heading animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/home" /> : <Auth />} />
        <Route path="/home" element={user ? <HomePage /> : <Navigate to="/" />} />
        <Route path="/invest" element={user ? <InvestPage /> : <Navigate to="/" />} />
        <Route path="/my-team" element={user ? <MyTeamPage /> : <Navigate to="/" />} />
        <Route path="/mine" element={user ? <MinePage /> : <Navigate to="/" />} />
        <Route path="/recharge" element={user ? <RechargePage /> : <Navigate to="/" />} />
        <Route path="/withdrawal" element={user ? <WithdrawalPage /> : <Navigate to="/" />} />
        <Route path="/support" element={user ? <CustomerSupport /> : <Navigate to="/" />} />
        <Route path="/change-password" element={user ? <ChangePassword /> : <Navigate to="/" />} />
        <Route path="/profile-view" element={user ? <ProfileView /> : <Navigate to="/" />} />
        <Route path="/gift-code" element={user ? <GiftCodePage /> : <Navigate to="/" />} />
        <Route path="/app" element={<AppPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/admin" element={user ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/admin/transactions" element={user ? <AdminTransactions /> : <Navigate to="/" />} />
        <Route path="/admin/gift-codes" element={user ? <AdminGiftCodes /> : <Navigate to="/" />} />
        <Route path="/admin/settings" element={user ? <AdminSettings /> : <Navigate to="/" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
