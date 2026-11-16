import api from "./api-temp.js";

// Get all deals
export const getDeals = async () => {
  try {
    const response = await api.get("/api/deals");

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to get deals");
    }

    return {
      deals: response.data.data || [],
      stats: response.data.stats || {},
      meta: response.data.meta || {},
    };
  } catch (error) {
    console.error("GET DEALS ERROR:", error.response?.data || error.message);
    throw error;
  }
};

// Get deal details
export const getDealById = async (id) => {
  try {
    const response = await api.get(`/api/deals/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to get deal");
    }

    return response.data.data;
  } catch (error) {
    console.error(
      "GET DEAL DETAILS ERROR:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Update deal
export const updateDeal = async (id, data) => {
  try {
    const response = await api.patch(`/api/deals/${id}`, data);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update deal");
    }

    return response.data.data;
  } catch (error) {
    console.error("UPDATE DEAL ERROR:", error.response?.data || error.message);
    throw error;
  }
};

// Add communication log
export const createDealCommunication = async (id, data) => {
  try {
    const response = await api.post(`/api/deals/${id}/communications`, data);

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to create communication",
      );
    }

    return response.data.data;
  } catch (error) {
    console.error(
      "CREATE DEAL COMMUNICATION ERROR:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Create deal

export const createDeal = async (data) => {
  try {
    const response = await api.post("/api/deals", data);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to create deal");
    }

    return response.data.data;
  } catch (error) {
    console.error("CREATE DEAL ERROR:", error.response?.data || error.message);
    throw error;
  }
};
// Export deals PDF
export const exportDealsPdf = async () => {
  try {
    const response = await api.get("/api/deals/export/pdf", {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: "application/pdf" }),
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "deals.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("EXPORT DEALS PDF ERROR:", error);
    throw error;
  }
};

// Export deals Excel
export const exportDealsExcel = async () => {
  try {
    const response = await api.get("/api/deals/export/excel", {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: response.headers["content-type"] }),
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "deals.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("EXPORT DEALS EXCEL ERROR:", error);
    throw error;
  }
};

export const deleteDeal = async (id) => {
  const response = await api.delete(`/api/deals/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to delete deal");
  }

  return response.data;
};
// Get deleted deals
export const getDeletedDeals = async () => {
  try {
    const response = await api.get("/api/deals/trash");

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to get deleted deals");
    }

    return response.data.data || [];
  } catch (error) {
    console.error("GET DELETED DEALS ERROR:", error.response?.data || error.message);
    throw error;
  }
};

// Restore deal
export const restoreDeal = async (id) => {
  try {
    const response = await api.post(`/api/deals/${id}/restore`);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to restore deal");
    }

    return response.data;
  } catch (error) {
    console.error("RESTORE DEAL ERROR:", error.response?.data || error.message);
    throw error;
  }
};

// Permanently delete deal
export const forceDeleteDeal = async (id) => {
  try {
    const response = await api.delete(`/api/deals/${id}/force`);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to permanently delete deal");
    }

    return response.data;
  } catch (error) {
    console.error("FORCE DELETE DEAL ERROR:", error.response?.data || error.message);
    throw error;
  }
};
