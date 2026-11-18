import api from "./api-temp.js";

// ==================== Team Members ====================

export const getTeamMembers = async () => {
  try {
    const response = await api.get("/api/team/members");

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to get team members");
    }

    return response.data.data || [];
  } catch (error) {
    console.error("Get team members error:", error);
    throw error;
  }
};

export const createTeamInvitation = async ({ name, email, role_id }) => {
  try {
    const response = await api.post("/api/team/members", {
      name,
      email,
      role_id,
    });

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to create team invitation",
      );
    }

    return response.data;
  } catch (error) {
    console.error("Create team invitation error:", error);
    throw error;
  }
};

// ==================== Team Roles ====================

export const getTeamRoles = async () => {
  try {
    const response = await api.get("/api/team/roles");

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to get team roles");
    }

    return response.data.data || [];
  } catch (error) {
    console.error("Get team roles error:", error);
    throw error;
  }
};

export const createTeamRole = async ({ name, description }) => {
  try {
    const response = await api.post("/api/team/roles", {
      name,
      description,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to create role");
    }

    return response.data;
  } catch (error) {
    console.error("Create team role error:", error);
    throw error;
  }
};

export const deleteTeamRole = async (roleId) => {
  try {
    const response = await api.delete(`/api/team/roles/${roleId}`);

    if (response.data?.success === false) {
      throw new Error(response.data.message || "Failed to delete role");
    }

    return response.data;
  } catch (error) {
    console.error("Delete team role error:", error);
    throw error;
  }
};

// ==================== Role Permissions ====================

export const getRolePermissions = async (roleId) => {
  try {
    const response = await api.get(`/api/team/roles/${roleId}/permissions`);

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to get role permissions",
      );
    }

    return response.data.data || {};
  } catch (error) {
    console.error("Get role permissions error:", error);
    throw error;
  }
};

export const updateRolePermissions = async (roleId, permissionIds) => {
  try {
    const response = await api.post(`/api/team/roles/${roleId}/permissions`, {
      permissions: permissionIds,
    });

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to update role permissions",
      );
    }

    return response.data;
  } catch (error) {
    console.error("Update role permissions error:", error);
    throw error;
  }
};
