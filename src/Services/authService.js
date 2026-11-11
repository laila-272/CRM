import api from "./api-temp";

export async function loginUser(values) {
  const response = await api.post("/api/auth/login", {
    email: values.email,
    password: values.password,
    device_name: "web",
  });

  const result = response.data;

  if (!result.success) {
    throw new Error(result.message || "Login failed");
  }

  localStorage.setItem("token", result.token);
  localStorage.setItem("user", JSON.stringify(result.data));

  return result;
}

export async function registerUser(values) {
  const payload = {
    name: values.name,
    phone: values.phone,
    password: values.password,
    password_confirmation: values.password_confirmation,
    device_name: "web",
  };

  if (values.email?.trim()) {
    payload.email = values.email.trim();
  }

  const response = await api.post("/api/auth/register", payload);

  const result = response.data;

  if (!result.success) {
    throw new Error(result.message || "Registration failed");
  }

  localStorage.setItem("token", result.token);
  localStorage.setItem("user", JSON.stringify(result.data));

  return result;
}
