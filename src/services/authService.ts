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
        // ✅ FIXED: Use consistent token key
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
    localStorage.removeItem("auth_token");  // ✅ FIXED
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
    return !!localStorage.getItem("auth_token");  // ✅ FIXED
  },

  async addUser(username: string, email: string, password: string, role: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest<AddUserResponse>("/api/admin/add-user", {
        method: "POST",
        body: JSON.stringify({
          username,
          email,
          password,
          role,
        }),
      });

      return {
        success: response.status === "success",
        message: response.message || "User added successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to add user",
      };
    }
  },

  async changeUserStatus(userId: string, status: string): Promise<{ success: boolean; message: string }> {
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

  async getAllUsers(): Promise<UserAccount[]> {
    try {
      const response = await apiRequest<{ users: BackendUser[] }>("/api/admin/users");

      return response.users.map((u, index) => ({
        id: u.id || String(index),
        username: u.username,
        email: u.email,
        password: "",
        role: (u.role as "user" | "admin") || "user",
        status: (u.status as "active" | "inactive") || "active",
        createdAt: u.created_at || new Date().toISOString(),
        reportsCount: u.total_reports || 0,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },


async updateUser(
  userId: string,
  data: { email?: string; password?: string }
): Promise<{ success: boolean; message?: string }> {
  try {
    await apiRequest(`/api/admin/update-user/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return { success: true };
  } catch (err) {
    console.error('Error updating user:', err);
    return { success: false, message: 'Failed to update user' };
  }
}



};
