import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/react";

interface AuthenticatedRouteProps {
  children: React.ReactNode;
}

/**
 * Renders children only when the user is signed in; otherwise redirects to welcome
 * with a return URL so after sign-in the user can be sent back.
 */
export function AuthenticatedRoute({ children }: AuthenticatedRouteProps) {
  const { isSignedIn } = useAuth();
  const location = useLocation();

  if (!isSignedIn) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/welcome?redirect=${redirect}`} replace />;
  }
  return <>{children}</>;
}
