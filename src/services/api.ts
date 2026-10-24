
const API_BASE_URL = `${
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
}/api`;

export const apiFetch = (
  path: string,
  options: RequestInit = {}
): Promise<Response> => {
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
  });
};