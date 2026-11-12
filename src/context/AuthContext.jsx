import { createContext, useContext, useEffect, useState } from "react";

import api from "../Services/api-temp.js";
import { loginUser } from "../Services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [permissions, setPermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [permissionsError, setPermissionsError] = useState(false);

  async function fetchPermissions(currentUser) {
    if (!currentUser?.roles?.length) {
      setPermissions([]);
      setPermissionsError(true);
      setLoadingPermissions(false);
      return;
    }

    setLoadingPermissions(true);
    setPermissionsError(false);

    try {
      const results = await Promise.all(
        currentUser.roles.map((role) =>
          api.get(`/api/team/roles/${role.id}/permissions`),
        ),
      );

      const allPermissions = results.flatMap(
        (res) => res.data?.data?.permissions || [],
      );
console.log("Fetched Permissions:", allPermissions);

      const permissionNames = [
        ...new Set(allPermissions.map((permission) => permission.name)),
      ];

      setPermissions(permissionNames);
      setPermissionsError(false);

      return permissionNames;
    } catch (error) {
      console.error("Failed to fetch permissions:", error);

      setPermissions([]);
      setPermissionsError(true);

      throw error;
    } finally {
      setLoadingPermissions(false);
    }
  }

  useEffect(() => {
    if (user) {
      fetchPermissions(user).catch(() => {});
    } else {
      setPermissions([]);
      setLoadingPermissions(false);
    }
  }, []);

  async function login(values) {
    const result = await loginUser(values);
    const currentUser = result.data;

    setUser(currentUser);

    try {
      await fetchPermissions(currentUser);
    } catch (error) {
      logout();
      throw new Error(
        "تم تسجيل الدخول ولكن تعذر تحميل الصلاحيات. حاولي مرة أخرى.",
      );
    }

    return result;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("permissions");

    setUser(null);
    setPermissions([]);
    setPermissionsError(false);
    setLoadingPermissions(false);
  }

  function hasPermission(permission) {
    return permissions.includes(permission);
  }

  function hasAnyPermission(permissionList = []) {
    return permissionList.some((permission) =>
      permissions.includes(permission),
    );
  }

  function hasAllPermissions(permissionList = []) {
    return permissionList.every((permission) =>
      permissions.includes(permission),
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        loadingPermissions,
        permissionsError,
        login,
        logout,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
