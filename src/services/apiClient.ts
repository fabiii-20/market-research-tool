// Base API configuration and utilities
const API_BASE_URL = import.meta.env.DEV ? "" : "http://62.171.152.195:8003";

// Get JWT token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

// Base fetch wrapper with authentication
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add existing headers from options
  if (options.headers) {
    const existingHeaders = options.headers as Record<string, string>;
    Object.assign(headers, existingHeaders);
  }

  // Add Authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle non-JSON responses (like PDF downloads)
    if (endpoint.includes("/download-report/")) {
      return response as unknown as T;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.detail || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export { API_BASE_URL };
