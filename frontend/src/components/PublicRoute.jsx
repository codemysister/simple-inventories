import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PublicRoute = ({ children, redirectTo = "/stock-movements" }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
};

export default PublicRoute;
