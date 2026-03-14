import { Navigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface AdminOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * Renders children only when the current user is an admin; otherwise redirects to home.
 */
export function AdminOnlyRoute({ children }: AdminOnlyRouteProps) {
  const roleResult = useQuery(api.users.getMyRole);

  if (roleResult === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (roleResult === null || roleResult.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
