export type AuthMode = "user" | "admin";
export type UserRole = "user" | "admin";
export type Category = "All" | "News" | "Articles" | "Papers";

export interface SearchResult {
  id: number;
  title: string;
  desc: string;
  cta: string;
  category: Category;
}

export interface Report {
  id: number;
  date: string;
  keywords: string[];
  user: string;
  parameters: string;
}

export interface UserLogin {
  email: string;
  loginTime: string;
  name?: string;
}

export interface AuthFormData {
  name?: string;
  email: string;
  password: string;
}
