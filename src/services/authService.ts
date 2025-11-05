import type { UserAccount } from "../types";

const USERS_KEY = "app_users";
const CURRENT_USER_KEY = "current_user";

// Dummy credentials for demo
const DUMMY_USERS: UserAccount[] = [
  {
    id: "admin-1",
    username: "admin",
    email: "admin@example.com",
    password: "Admin@123",
    role: "admin",
    status: "active",
    createdAt: new Date().toISOString(),
    reportsCount: 0,
  },
  {
    id: "user-1",
    username: "user",
    email: "user@example.com",
    password: "User@123",
    role: "user",
    status: "active",
    createdAt: new Date().toISOString(),
    reportsCount: 0,
  },
];

export const authService = {
  // Initialize users in localStorage if empty
  initializeUsers(): void {
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DUMMY_USERS));
    }
  },

  // Get all users
  getAllUsers(): UserAccount[] {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Login and determine role
  async login(username: string, password: string): Promise<{ success: boolean; user?: UserAccount; message?: string }> {
    await new Promise((r) => setTimeout(r, 500));

    // TODO: Replace with real API call
    // const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ username, password })
    // });
    // const data = await response.json();
    // if (data.success) {
    //   localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
    //   return { success: true, user: data.user };
    // }

    const users = this.getAllUsers();
    const user = users.find((u) => u.username === username && u.password === password);

    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return { success: true, user };
    }

    return { success: false, message: "Invalid username or password" };
  },

  // Get current logged-in user
  getCurrentUser(): UserAccount | null {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  // Logout
  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Add new user
  addUser(user: Omit<UserAccount, "id" | "createdAt" | "reportsCount">): { success: boolean; message: string } {
    const users = this.getAllUsers();

    // Email validation - unique check
    if (users.some((u) => u.email === user.email)) {
      return { success: false, message: "Email already exists" };
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(user.password)) {
      return {
        success: false,
        message: "Password must be 8+ chars with letters, numbers, and special characters",
      };
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      return { success: false, message: "Invalid email format" };
    }

    const newUser: UserAccount = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      reportsCount: 0,
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // TODO: Send to backend API
    // await fetch('/api/users', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(newUser)
    // });

    return { success: true, message: "User created successfully" };
  },

  // Update user
  updateUser(id: string, updates: Partial<UserAccount>): { success: boolean; message: string } {
    const users = this.getAllUsers();
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      return { success: false, message: "User not found" };
    }

    const user = users[index];

    // Email validation if changed
    if (updates.email && updates.email !== user.email) {
      if (users.some((u) => u.email === updates.email && u.id !== id)) {
        return { success: false, message: "Email already exists" };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        return { success: false, message: "Invalid email format" };
      }
    }

    // Password validation if changed
    if (updates.password) {
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
      if (!passwordRegex.test(updates.password)) {
        return {
          success: false,
          message: "Password must be 8+ chars with letters, numbers, and special characters",
        };
      }
    }

    users[index] = { ...user, ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    return { success: true, message: "User updated successfully" };
  },

  // Delete user
  deleteUser(id: string): { success: boolean; message: string } {
    const users = this.getAllUsers();
    const filtered = users.filter((u) => u.id !== id);

    if (filtered.length === users.length) {
      return { success: false, message: "User not found" };
    }

    localStorage.setItem(USERS_KEY, JSON.stringify(filtered));

    // TODO: Send to backend API
    // await fetch(`/api/users/${id}`, { method: 'DELETE' });

    return { success: true, message: "User deleted successfully" };
  },
};
