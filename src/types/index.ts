

export type AuthMode = "login";
export type UserRole = "user" | "admin";
export type Category = "All" | "News" | "Articles" | "Papers";


export interface SearchResultItem {
  topic: string;
  summary: string;
  link: string;
  data_type: string;
}

export interface Report {
  username: string;
  id: number;
  date: string;
  keywords: string[];
  user: string;
  categories?: Category[];
  reportLink?: string; 
  reportId?: string;
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

//Paginated response interface
export interface PaginatedResponse<T> {
  status: string;
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

//Backend research data item
export interface ResearchDataItem {
  topic: string;
  summary: string;
  link: string;
  data_type: string;
}

//Search request with search_id
export interface SearchRequest {
  search_id: string;
  keywords: string[];
  data_type: string[];
}

//Get data response
export interface GetDataResponse {
  status: string;
  message: string;
  search_id: string;
}

// Update SearchResult to include data_type
export interface SearchResult {
  id: number;
  title: string;
  desc: string;
  category: Category;
  link?: string;
  data_type?: string;
}

