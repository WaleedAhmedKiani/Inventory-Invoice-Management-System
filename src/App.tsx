import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";

// Store & Services
import { useAuthStore } from "./store/authStore";
import { getProfile } from "./services/auth.service";

// Components & Pages
import ProtectedLayout from "./routes/Protected";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Products from "./pages/products/Products";
import Invoices from "./pages/invoices/Invoice";
import CreateInvoice from "./pages/invoices/Createinvoice";
import InvoiceDetails from "./pages/invoices/InvoiceDetails";
import Dashboard from "./pages/dashboard/Dashboard";
import Customers from "./pages/customer/Customers";
import CreateCustomer from "./pages/customer/CreateCustomer";
import CustomerDetails from "./pages/customer/CustomerDetails";
import AuditLogs from "./pages/audit/AuditLog";
import BillingPage from "./pages/billing/BillingPage";



const App = () => {
  const { setUser, setChecking, isChecking } = useAuthStore();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await getProfile();
        setUser(res.user);
      } catch (error) {
        setUser(null);
      } finally {
        setChecking(false);
      }
    };

    restoreSession();
  }, [setUser, setChecking]);

  // Loading Screen while checking auth
  if (isChecking) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
        <span className="ml-3 text-lg font-medium text-gray-700">Loading...</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboard - Accessible to all logged-in roles */}
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />

        {/* Products - Restricted to OWNER and ADMIN */}
        <Route
          path="/products"
          element={
            <ProtectedLayout allowedRoles={["OWNER", "ADMIN"]}>
              <Products />
            </ProtectedLayout>
          }
        />

        {/* Customers - Accessible to OWNER, ADMIN, and STAFF */}
        <Route
          path="/customers"
          element={
            <ProtectedLayout allowedRoles={["OWNER", "ADMIN", "STAFF"]}>
              <Customers />
            </ProtectedLayout>
          }
        />

        {/* Create Customer */}
        <Route
          path="/customers/create"
          element={
            <ProtectedLayout allowedRoles={["OWNER", "ADMIN", "STAFF"]}>
              <div className="p-6 max-w-2xl mx-auto">
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <CreateCustomer />
                </div>
              </div>
            </ProtectedLayout>
          }
        />
        {/* Update Customer */}
        <Route
          path="/customers/:id"
          element={
            <ProtectedLayout allowedRoles={["OWNER", "ADMIN", "STAFF"]}>
              <div className="p-6 max-w-2xl mx-auto">
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <CustomerDetails />
                </div>
              </div>
            </ProtectedLayout>
          }
        />

        {/* Invoices List */}
        <Route
          path="/invoices"
          element={
            <ProtectedLayout allowedRoles={["OWNER", "ADMIN", "STAFF"]}>
              <Invoices />
            </ProtectedLayout>
          }
        />

        {/* Create Invoice */}
        <Route
          path="/invoices/create"
          element={
            <ProtectedLayout allowedRoles={["OWNER", "ADMIN", "STAFF"]}>
              <CreateInvoice />
            </ProtectedLayout>
          }
        />
        {/* Invoice Details */}
        <Route
          path="/invoices/:id"
          element={
            <ProtectedLayout allowedRoles={["OWNER", "ADMIN", "STAFF"]}>
              <InvoiceDetails />
            </ProtectedLayout>
          }
        />

        {/* Audit Logs */}
        <Route
          path="/audit-logs"
          element={
            <ProtectedLayout allowedRoles={["OWNER", "ADMIN"]}>
              <AuditLogs />
            </ProtectedLayout>
          }
        />


        {/* Settings - Restricted to OWNER only */}
        <Route
          path="/settings/billing"
          element={
            <ProtectedLayout allowedRoles={["OWNER"]}>
              <BillingPage />
            </ProtectedLayout>
          }
        />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 Catch-all */}
        <Route path="*" element={
          <div className="h-screen flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold text-gray-800">404</h1>
            <p className="text-gray-600">Page not found</p>
          </div>
        } />
      </Routes>

      <Toaster position="top-right" />
    </BrowserRouter>
  );
};

export default App;