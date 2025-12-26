import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import AuthPage from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import SetupPage from "./pages/Setup";
import PatientsPage from "./pages/Patients";
import OPDQueuePage from "./pages/OPDQueue";
import AppointmentsPage from "./pages/Appointments";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
            <Route path="/patients" element={<DashboardLayout><PatientsPage /></DashboardLayout>} />
            <Route path="/appointments" element={<DashboardLayout><AppointmentsPage /></DashboardLayout>} />
            <Route path="/opd-queue" element={<DashboardLayout><OPDQueuePage /></DashboardLayout>} />
            <Route path="/consultations" element={<DashboardLayout><div className="text-xl font-semibold">Consultations Module</div></DashboardLayout>} />
            <Route path="/vitals" element={<DashboardLayout><div className="text-xl font-semibold">Vitals Module</div></DashboardLayout>} />
            <Route path="/lab-orders" element={<DashboardLayout><div className="text-xl font-semibold">Lab Orders Module</div></DashboardLayout>} />
            <Route path="/pharmacy" element={<DashboardLayout><div className="text-xl font-semibold">Pharmacy Module</div></DashboardLayout>} />
            <Route path="/inventory" element={<DashboardLayout><div className="text-xl font-semibold">Inventory Module</div></DashboardLayout>} />
            <Route path="/billing" element={<DashboardLayout><div className="text-xl font-semibold">Billing Module</div></DashboardLayout>} />
            <Route path="/ehr" element={<DashboardLayout><div className="text-xl font-semibold">EHR Module</div></DashboardLayout>} />
            <Route path="/ipd" element={<DashboardLayout><div className="text-xl font-semibold">IPD Module</div></DashboardLayout>} />
            <Route path="/reports" element={<DashboardLayout><div className="text-xl font-semibold">Reports Module</div></DashboardLayout>} />
            <Route path="/staff" element={<DashboardLayout><div className="text-xl font-semibold">Staff Management</div></DashboardLayout>} />
            <Route path="/tenants" element={<DashboardLayout><div className="text-xl font-semibold">Tenants Management</div></DashboardLayout>} />
            <Route path="/settings" element={<DashboardLayout><div className="text-xl font-semibold">Settings</div></DashboardLayout>} />
            <Route path="/profile" element={<DashboardLayout><div className="text-xl font-semibold">Profile</div></DashboardLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
