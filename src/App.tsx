import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import SchedulerPage from "./pages/SchedulerPage";
import PatientsPage from "./pages/PatientsPage";
import AddPatientPage from "./pages/AddPatientPage";
import EditPatientPage from "./pages/EditPatientPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/doctor-dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <DoctorDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/scheduler" element={
              <ProtectedRoute>
                <Layout>
                  <SchedulerPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/patients" element={
              <ProtectedRoute>
                <Layout>
                  <PatientsPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/add-patient" element={
              <ProtectedRoute>
                <Layout>
                  <AddPatientPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/edit-patient/:id" element={
              <ProtectedRoute>
                <Layout>
                  <EditPatientPage />
                </Layout>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
