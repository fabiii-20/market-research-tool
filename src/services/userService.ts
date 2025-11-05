import type { UserLogin } from "../types";

const STORAGE_KEY = "user_logins";

export const userService = {
  // Get all logged-in users from localStorage
  getLoggedUsers(): UserLogin[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Add a new user login
  addUserLogin(email: string, name?: string): void {
    const users = this.getLoggedUsers();
    const newLogin: UserLogin = {
      email,
      name: name || email.split("@")[0],
      loginTime: new Date().toISOString(),
    };

    // Check if user already logged in
    const existingIndex = users.findIndex((u) => u.email === email);
    if (existingIndex >= 0) {
      users[existingIndex] = newLogin; // Update timestamp
    } else {
      users.push(newLogin);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

    // TODO: Send to backend when ready
    // await fetch('/api/users/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(newLogin)
    // });
  },

  // Clear all user logins (for testing)
  clearLogins(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Get unique user count
  getUserCount(): number {
    return this.getLoggedUsers().length;
  },
};
