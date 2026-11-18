import api from "./api-temp.js";

// Get all commissions
export const getCommissions = async () => {
  const { data } = await api.get("/api/commissions");

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch commissions");
  }

  return data;
};

// Get commission statistics
export const getCommissionStats = async () => {
  const { data } = await api.get("/api/commissions/stats");

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch commission stats");
  }

  return data.data;
};

// Create commission
export const createCommission = async (commissionData) => {
  const { data } = await api.post("/api/commissions", commissionData);

  if (!data.success) {
    throw new Error(data.message || "Failed to create commission");
  }

  return data;
};

// Get deals for commission form
export const getDealsForCommissions = async () => {
  const { data } = await api.get("/api/deals");

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch deals");
  }

  return data.data;
};
export const updateCommission = async (id, commissionData) => {
  const { data } = await api.patch(`/api/commissions/${id}`, commissionData);

  if (!data.success) {
    throw new Error(data.message || "Failed to update commission");
  }

  return data;
};
