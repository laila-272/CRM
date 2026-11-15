import api from "./api-temp.js";

// Get leads with search, status filter, and pagination
export const getLeads = async ({
  page = 1,
  per_page = 7,
  search = "",
  status = "",
} = {}) => {
  try {
    const params = {
      page,
      per_page,
      sort: "newest",
    };

    if (search.trim()) params.search = search.trim();
    if (status) params.status = status;

    const response = await api.get("/api/leads", { params });

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch leads");
    }

    return response.data;
  } catch (error) {
    console.error("GET LEADS ERROR:", error.response?.data || error.message);
    throw error;
  }
};

// Get lead sources
export const getLeadSources = async () => {
  try {
    const response = await api.get("/api/sources");

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch sources");
    }

    return response.data.data || [];
  } catch (error) {
    console.error("GET SOURCES ERROR:", error.response?.data || error.message);
    throw error;
  }
};

// Get team members
export const getTeamMembers = async () => {
  try {
    const response = await api.get("/api/team/members");

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch team members");
    }

    return response.data.data || [];
  } catch (error) {
    console.error(
      "GET TEAM MEMBERS ERROR:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Create a new lead
export const createLead = async (leadData) => {
  try {
    const response = await api.post("/api/leads", leadData);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to create lead");
    }

    return response.data;
  } catch (error) {
    console.error("CREATE LEAD ERROR:", error.response?.data || error.message);
    throw error;
  }
};
// Export leads to Excel
export const exportLeadsExcel = async () => {
  const response = await api.get("/api/leads/export/excel", {
    responseType: "blob",
  });

  return response.data;
};

// Export leads to PDF
export const exportLeadsPdf = async () => {
  const response = await api.get("/api/leads/export/pdf", {
    responseType: "blob",
  });

  return response.data;
};
// Get lead details by ID
export const getLeadById = async (id) => {
  try {
    const response = await api.get(`/api/leads/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to get lead details");
    }

    return response.data.data;
  } catch (error) {
    console.error(
      "LEAD DETAILS API ERROR:",
      error.response?.data || error.message,
    );

    throw error;
  }
};
// Export single lead to Excel
export const exportLeadExcel = async (id) => {
  const response = await api.get(`/api/leads/${id}/export/excel`, {
    responseType: "blob",
  });

  return response.data;
};

// Export single lead to PDF
export const exportLeadPdf = async (id) => {
  const response = await api.get(`/api/leads/${id}/export/pdf`, {
    responseType: "blob",
  });

  return response.data;
};
// Update lead
export const updateLead = async (id, data) => {
  try {
    const response = await api.patch(`/api/leads/${id}`, data);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update lead");
    }

    return response.data.data;
  } catch (error) {
    console.error(
      "UPDATE LEAD API ERROR:",
      error.response?.data || error.message,
    );

    throw error;
  }
};
// Create lead communication
export const createLeadCommunication = async (id, data) => {
  try {
    const response = await api.post(`/api/leads/${id}/communications`, data);

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to create communication",
      );
    }

    return response.data.data;
  } catch (error) {
    console.error(
      "CREATE LEAD COMMUNICATION ERROR:",
      error.response?.data || error.message,
    );

    throw error;
  }
};
export const convertLead = async (id) => {
  try {
    const response = await api.post(`/api/leads/${id}/convert`);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to convert lead");
    }

    return response.data.data;
  } catch (error) {
    console.error("CONVERT LEAD ERROR:", error.response?.data || error.message);
    throw error;
  }
};
// Archive/Delete lead
// Archive lead (Soft Delete)
export const deleteLead = async (id) => {
  const response = await api.delete(`/api/leads/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to archive lead");
  }

  return response.data;
};

// Permanently delete lead
export const forceDeleteLead = async (id) => {
  const response = await api.delete(`/api/leads/${id}/force`);

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to permanently delete lead");
  }

  return response.data;
};
// Get archived leads
export const getDeletedLeads = async () => {
  const response = await api.get("/api/leads/trash");

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to get archived leads");
  }

  return response.data.data;
};

// Restore archived lead
export const restoreLead = async (id) => {
  const response = await api.post(`/api/leads/${id}/restore`);

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to restore lead");
  }

  return response.data;
};

