import api from "./api-temp.js";

// Get all partners
export const getPartners = async () => {
  const response = await api.get("/api/partners");

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to get partners");
  }

  return response.data.data;
};

// Create partner
export const createPartner = async (data) => {
  const response = await api.post("/api/partners", data);

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to create partner");
  }

  return response.data.data;
};

// Delete partner
export const deletePartner = async (id) => {
  const response = await api.delete(`/api/partners/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to delete partner");
  }

  return response.data;
};
