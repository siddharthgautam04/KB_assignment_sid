import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { LoginPage } from "./pages/LoginPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { ResourceDetailPage } from "./pages/ResourceDetailPage";
import { AdminPage } from "./pages/AdminPage";

import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import GuestRoute from "./components/layout/GuestRoute"; // ← add this file as shown earlier

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Guest-only: if logged in, redirect away */}
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              }
            />

            {/* Protected area */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navigate to="/resources" replace />
                </ProtectedRoute>
              }
            />

            <Route
              path="/resources"
              element={
                <ProtectedRoute>
                  <ResourcesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/resources/:id"
              element={
                <ProtectedRoute>
                  <ResourceDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;