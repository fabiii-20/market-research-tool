import type { UserAccount } from "../types";
import { apiRequest } from "./apiClient";

interface LoginResponse {
  status: string;
  role: string | null;
  token: string | null;
  message: string;
}

interface AddUserResponse {
  status: string;
  message: string;
}

interface BackendUser {
  id?: string;
  username: string;
  email: string;
  role?: string;
  status?: string;
  created_at?: string;
  total_reports?: number;
}

export const authService = {
  initializeUsers(): void {
    // No-op for backend API
  },

  async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: UserAccount; message?: string }> {
    try {
      const response = await apiRequest<LoginResponse>("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (response.status === "success" && response.token) {
        localStorage.setItem("auth_token", response.token);
        
        const user: UserAccount = {
          id: email,
          username: email.split("@")[0],
          email: email,
          password: "",
          role: (response.role as "user" | "admin") || "user",
          status: "active",
          createdAt: new Date().toISOString(),
          reportsCount: 0,
        };

        localStorage.setItem("currentUser", JSON.stringify(user));
        return { success: true, user };
      }

      return {
        success: false,
        message: response.message || "Login failed",
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Login failed",
      };
    }
  },

  logout(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("currentUser");
  },

  getCurrentUser(): UserAccount | null {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("auth_token");
  },

  async addUser(
    username: string,
    email: string,
    password: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
       const requestBody = { username, email, password };
        console.log("Add User Request Payload:", requestBody);
      const response = await apiRequest<AddUserResponse>("/api/admin/add-user", {
        method: "POST",
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });
     

      return {
        success: response.status === "success",
        message: response.message || "User added successfully",
      };
    } catch (error) {
  if (error instanceof Error) {
    console.error("Add User API error:", error.message, error);
    return { success: false, message: error.message };
  } else if (typeof error === "object") {
    console.error("Add User API error object:", JSON.stringify(error));
    return { success: false, message: "Failed to add user (see console for details)" };
  } else {
    console.error("Unknown Add User API error:", error);
    return { success: false, message: "Failed to add user" };
  }
}

  },

  async changeUserStatus(
    userId: string,
    status: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest<{ status: string; message: string }>(
        `/api/admin/change-status/${userId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }
      );

      return {
        success: response.status === "success",
        message: response.message || "Status updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update status",
      };
    }
  },

async getAllUsers(): Promise<{
  users: UserAccount[];
}> {
  try {
    const response = await apiRequest<{
      users: BackendUser[];
    }>("/api/admin/users", {
      method: "GET",
    });

    const users: UserAccount[] = response.users.map((u) => ({
      id: u.id || u.email,
      username: u.username,
      email: u.email,
      password: "",
      role: (u.role as "user" | "admin") || "user",
      status: (u.status as "active" | "inactive") || "active",
      createdAt: u.created_at || new Date().toISOString(),
      reportsCount: u.total_reports || 0,
    }));

    return {
      users,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { users: [] };
  }
},

  // ✅ UPDATED: Add role support
  async updateUser(
    userId: string,
    updates: {
      username?: string;
      email?: string;
      password?: string;
      role?: "user" | "admin"; // ✅ Add role support
    }
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiRequest<{ status: string; message: string }>(
        `/api/admin/update-user/${userId}`,
        {
          method: "PATCH",
          body: JSON.stringify(updates),
        }
      );

      return {
        success: response.status === "success",
        message: response.message,
      };
    } catch (error) {
      console.error("Error updating user:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to update user" 
      };
    }
  },
};
