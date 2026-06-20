import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// Add allowedRoles 
export default function ProtectedRoute({ children, allowedRoles }: any) {
  const user = useAuthStore((s) => s.user);
  const isChecking = useAuthStore((s) => s.isChecking);

  if (isChecking) return <div>Loading...</div>; // Prevent flickering

  if (!user) return <Navigate to="/login" replace />;

  // ROLE CHECK: If page needs specific roles and user doesn't have them
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}