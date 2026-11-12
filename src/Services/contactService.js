import api from "./api-temp.js";

// Get all customers
export const getCustomers = async () => {
  try {
    const response = await api.get("/api/customers");

    console.log("CUSTOMERS RESPONSE:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "CUSTOMERS API ERROR:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

// Get customer by ID
export const getCustomerById = async (id) => {
  try {
    const response = await api.get(`/api/customers/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to get customer");
    }

    return response.data.data;
  } catch (error) {
    console.error(
      "CUSTOMER DETAILS API ERROR:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

// Create customer
export const createCustomer = async (customer) => {
  try {
    console.log("CREATE CUSTOMER PAYLOAD:", customer);

    const response = await api.post("/api/customers", customer);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to create customer");
    }

    return response.data.data;
  } catch (error) {
    console.error(
      "CREATE CUSTOMER ERROR:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

// Update customer
export const updateCustomer = async (id, customer) => {
  try {
    console.log("UPDATE CUSTOMER PAYLOAD:", customer);

    const response = await api.patch(`/api/customers/${id}`, customer);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update customer");
    }

    return response.data.data;
  } catch (error) {
    console.error(
      "UPDATE CUSTOMER ERROR:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Get team members
export const getTeamMembers = async () => {
  try {
    const response = await api.get("/api/team/members");

    console.log("TEAM RESPONSE:", response.data);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to get team members");
    }

    return response.data.data;
  } catch (error) {
    console.error("TEAM API ERROR:", error.response?.data || error.message);

    throw error;
  }
};
// Move customer to recycle bin
export const deleteCustomer = async (id) => {
  try {
    const response = await api.delete(`/api/customers/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete customer");
    }

    return response.data;
  } catch (error) {
    console.error(
      "DELETE CUSTOMER ERROR:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
// Restore customer from recycle bin
export const restoreCustomer = async (id) => {
  try {
    const response = await api.post(`/api/customers/${id}/restore`);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to restore customer");
    }

    return response.data.data;
  } catch (error) {
    console.error(
      "RESTORE CUSTOMER ERROR:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
export const getDeletedCustomers = async () => {
  try {
    const response = await api.get("/api/customers/trash");

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to fetch deleted customers",
      );
    }

    return response.data.data;
  } catch (error) {
    console.error(
      "GET DELETED CUSTOMERS ERROR:",
      error.response?.data || error.message,
    );
    throw error;
  }
};