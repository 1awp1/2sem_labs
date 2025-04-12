import { Navigate } from "react-router-dom";
import { useAuth } from "@/utils/localStorageUtils";
import { JSX } from "react";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};