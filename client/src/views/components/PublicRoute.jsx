import { Navigate } from "react-router-dom";
import { useAppController } from "../../controllers/AppController.jsx";
import LoaderState from "./LoaderState.jsx";

export default function PublicRoute({ children }) {
   const { user, loading } = useAppController();

   if (loading) {
      return <LoaderState label="Checking authentication..." />;
   }

   if (user) {
      // Role-based redirect
      if (user.role === "admin" || user.role === "system_admin") {
         return <Navigate to="/app/admin/overview" replace />;
      }

      if (user.activeMode === "worker") {
         return <Navigate to="/app/worker/feed" replace />;
      }

      return <Navigate to="/app/employer/dashboard" replace />;
   }

   return children;
}