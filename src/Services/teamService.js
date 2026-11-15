import api from "./api-temp.js";

// Get all team members
export const getTeamMembers = async () => {
  try {
    const response = await api.get("/api/team/members");

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to get team members");
    }

    return response.data.data;
  } catch (error) {
    console.error(
      "GET TEAM MEMBERS ERROR:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Get all team roles
export const getTeamRoles = async () => {
  try {
    const response = await api.get("/api/team/roles");

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to get team roles");
    }

    return response.data.data;
  } catch (error) {
    console.error(
      "GET TEAM ROLES ERROR:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Create team invitation
export const createTeamInvitation = async ({ name, email, role_id }) => {
  try {
    const response = await api.post("/api/team/members", {
      name,
      email,
      role_id: Number(role_id),
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to send invitation");
    }

    return response.data.data;
  } catch (error) {
    console.error(
      "CREATE TEAM INVITATION ERROR:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
