import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <main className="auth-status" role="status">Restoring your session...</main>;
  }

  return user
    ? <Outlet />
    : <Navigate to="/login" replace state={{ from: location }} />;
}