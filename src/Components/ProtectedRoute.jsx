import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ permission }) {
  const { user, hasPermission, loadingPermissions } = useAuth();

  if (!user || !localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  if (loadingPermissions) {
    return (
      <div className="grid min-h-screen place-items-center">
        جاري تحميل الصلاحيات...
      </div>
    );
  }

  if (permission && !hasPermission(permission)) {
    return (
      <div dir="rtl" className="p-8 text-center">
        <h2 className="text-xl font-bold">
          ليس لديك صلاحية للوصول إلى هذه الصفحة
        </h2>
      </div>
    );
  }

  return <Outlet />;
}
