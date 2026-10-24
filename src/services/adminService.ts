
import { apiFetch } from "./api";

interface ApiResponse {
  success: boolean;
  message?: string;
  authenticated?: boolean;
}

export const loginAdmin = async (
  email: string,
  password: string
): Promise<void> => {
  const response = await apiFetch("/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const result = (await response.json()) as ApiResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Admin login failed.");
  }
};

export const checkAdminSession = async (): Promise<boolean> => {
  const response = await apiFetch("/admin/session");

  if (response.status === 401) {
    return false;
  }

  if (!response.ok) {
    throw new Error("Unable to verify admin session.");
  }

  const result = (await response.json()) as ApiResponse;
  return result.success && result.authenticated === true;
};

export const logoutAdmin = async (): Promise<void> => {
  const response = await apiFetch("/admin/logout", {
    method: "POST",
  });

  const result = (await response.json()) as ApiResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Admin logout failed.");
  }
};