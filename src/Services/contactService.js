import api from "./api-temp.js";

export const getCustomers = async () => {
  try {
    const response = await api.get("/api/customers");

    console.log("URL:", response.config.baseURL);
    console.log("Request URL:", response.config.url);
    console.log(
      "Authorization exists:",
      !!response.config.headers?.Authorization,
    );
    console.log("Response:", response.data);

    return response.data;
  } catch (error) {
    console.error("Customers API Error:", error.response?.data || error);
    throw error;
  }
};
export const getCustomerById = async (id) => {
  try {
    const response = await api.get(`/api/customers/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to get customer");
    }

    return response.data.data;
  } catch (error) {
    console.error("Customer Details API Error:", error.response?.data || error);
    throw error;
  }
};