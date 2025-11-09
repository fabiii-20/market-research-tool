export type AuthMode = "login";
export type UserRole = "user" | "admin";
export type Category = "All" | "News" | "Articles" | "Papers";

export interface SearchResult {
  id: number;
  title: string;
  desc: string;
  // cta?: string;
  category: Category;
  link?: string; // Add this line - some results have external links
}

export interface Report {
  id: number;
  date: string;
  keywords: string[];
  user: string;
  categories?: Category[];
  report_link?: string; // Add this line - for PDF download links
  report_id?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  status: "active" | "inactive";
  createdAt: string;
  reportsCount: number;
}

export interface AuthFormData {
  username: string;
  password: string;
}

export interface ReportApiResponse {
  reports: Report[];
  totalUsers: number;
  reportsGenerated: number;
}

export interface SearchActivity {
  id: string;
  userId: string;
  username: string;
  date: string;
  keywords: string[];
  categories: Category[];
  timestamp: number;
}
