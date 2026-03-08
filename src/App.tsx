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
  const { user } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/home" /> : <Auth />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/invest" element={<InvestPage />} />
        <Route path="/my-team" element={<MyTeamPage />} />
        <Route path="/mine" element={<MinePage />} />
        <Route path="/recharge" element={<RechargePage />} />
        <Route path="/withdrawal" element={<WithdrawalPage />} />
        <Route path="/support" element={<CustomerSupport />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/profile-view" element={<ProfileView />} />
        <Route path="/gift-code" element={<GiftCodePage />} />
        <Route path="/app" element={<AppPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/transactions" element={<AdminTransactions />} />
        <Route path="/admin/gift-codes" element={<AdminGiftCodes />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
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
