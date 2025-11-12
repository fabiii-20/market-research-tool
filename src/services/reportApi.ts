import type { Report, Category } from "../types";
import { apiRequest, API_BASE_URL } from "./apiClient";

interface AnalyticsResponse {
  total_reports: number;
  total_users: number;
}

interface BackendReport {
  report_id?: string;
  reportId?: string;
  id?: string;
  created_at: string;
  createdat?: string;
  keywords: string[];
  user_id?: string;
  userid?: string;
  parameters?: {
    data_type?: string | string[];
    user_id?: string;
    [key: string]: unknown;
  };
  reportLink?: string;
  report_link?: string;
}

interface ReportsResponse {
  reports: BackendReport[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface AnalyticsRequestBody {
  date_filter: boolean;
  from_date?: string;
  to_date?: string;
}

interface SearchResultItem {
  search_id: string;
  date: string;
  keywords: string[];
  data_types: string[];
  user_id: string;
  username: string;
  email: string;
}

interface SearchResultsResponse {
  searches: SearchResultItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const toCategory = (dataType?: string | string[]): Category[] => {
  if (!dataType) return [];
  const types = Array.isArray(dataType) ? dataType : [dataType];
  const mapping: Record<string, Category> = {
    news: "News",
    article: "Articles",
    research: "Papers",
  };
  const categories: Category[] = [];
  for (const type of types) {
    if (typeof type === "string") {
      const category = mapping[type.toLowerCase()];
      if (category && !categories.includes(category)) {
        categories.push(category);
      }
    }
  }
  return categories.length > 0 ? categories : ["All"];
};

export const reportAPI = {
  async getAnalytics(
    dateFilter: boolean = false,
    fromDate?: string,
    toDate?: string
  ): Promise<{ totalUsers: number; reportsGenerated: number }> {
    try {
      const body: AnalyticsRequestBody = { date_filter: dateFilter };
      if (fromDate) body.from_date = fromDate;
      if (toDate) body.to_date = toDate;
      const response = await apiRequest<AnalyticsResponse>(
        "/api/admin/analytics",
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );
      return {
        totalUsers: response.total_users || 0,
        reportsGenerated: response.total_reports || 0,
      };
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return { totalUsers: 0, reportsGenerated: 0 };
    }
  },

  async getAdminSearchResults(
    userId: string = "all",
    page: number = 1,
    pageSize: number = 10,
    fromDate?: string,
    toDate?: string
  ): Promise<{
    reports: Report[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      // Build query params
      let queryParams = `page=${page}&page_size=${pageSize}`;
      if (userId !== "all" && userId !== "All Users") {
        queryParams += `&user_id=${userId}`;
      }
      if (fromDate) queryParams += `&from_date=${fromDate}`;
      if (toDate) queryParams += `&to_date=${toDate}`;

      const response = await apiRequest<SearchResultsResponse>(
        `/api/admin/search-results?${queryParams}`
      );

      const reports: Report[] = response.searches.map((search, index) => ({
  id: (page - 1) * pageSize + index + 1,
  date: new Date(search.date).toISOString().split("T")[0],
  keywords: search.keywords || [],
  user: search.username || "user-fallback", 
  categories: toCategory(search.data_types),
  reportLink: `/api/download-report/${search.search_id}`,
  reportId: search.search_id,
}));

      return {
        reports,
        total: response.total,
        totalPages: response.total_pages,
        currentPage: response.page,
      };
    } catch (error) {
      console.error("❌ Error fetching search results:", error);
      return {
        reports: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
      };
    }
  },

  async getAdminReports(
    userId: string = "all",
    page: number = 1,
    pageSize: number = 10,
    fromDate?: string,
    toDate?: string
  ): Promise<{
    reports: Report[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      let queryParams = `page=${page}&page_size=${pageSize}`;
      if (userId !== "all" && userId !== "All Users") {
        queryParams += `&user_id=${userId}`;
      }
      if (fromDate) queryParams += `&from_date=${fromDate}`;
      if (toDate) queryParams += `&to_date=${toDate}`;

      const response = await apiRequest<ReportsResponse>(
        `/api/admin/reports?${queryParams}`
      );

      // Optionally fetch users for mapping, but this should be minimized or cached.
      // Remove if backend already provides user emails with each report.
      // const usersResponse = await apiRequest<{ users: BackendUser[] }>("/api/admin/users?page=1&page_size=1000");
      // ...user mapping logic, if needed...

      const reports: Report[] = response.reports
        .map((r, index) => {
          const reportId = r.report_id || r.reportId || r.id;
          const reportLink = r.report_link || r.reportLink;
          const createdAt =
            r.created_at || r.createdat || new Date().toISOString();
          // Choose appropriate user/email mapping logic here.
          const user = r.user_id || r.userid || "user@example.com";
          return {
            id: (page - 1) * pageSize + index + 1,
            date: new Date(createdAt).toISOString().split("T")[0],
            keywords: r.keywords || [],
            user: user,
            categories: toCategory(r.parameters?.data_type),
            reportLink: reportLink,
            reportId: reportId,
          };
        })
        .filter((r) => r.reportId);

      return {
        reports,
        total: response.total,
        totalPages: response.total_pages,
        currentPage: response.page,
      };
    } catch (error) {
      console.error("❌ Error fetching admin reports:", error);
      return {
        reports: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
      };
    }
  },

  async getUserReports(
    page: number = 1,
    pageSize: number = 10
  ): Promise<{
    reports: Report[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const response = await apiRequest<ReportsResponse>(
        `/api/reports?page=${page}&page_size=${pageSize}`
      );

      const reports: Report[] = response.reports
        .map((r, index) => {
          const reportId = r.report_id || r.reportId;
          if (!reportId) {
            console.error(`❌ User report ${index} missing report_id`);
            return null;
          }
          return {
            id: (page - 1) * pageSize + index + 1,
            date: new Date(r.created_at).toISOString().split("T")[0],
            keywords: r.keywords || [],
            user: "Me",
            categories: toCategory(r.parameters?.data_type),
            reportLink: r.report_link || r.reportLink,
            reportId: reportId,
          };
        })
        .filter((r) => r !== null) as Report[];

      return {
        reports,
        total: response.total,
        totalPages: response.total_pages,
        currentPage: response.page,
      };
    } catch (error) {
      console.error("❌ Error fetching user reports:", error);
      return {
        reports: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
      };
    }
  },

  async getUserOwnReports(): Promise<Report[]> {
    try {
      const response = await apiRequest<{ reports: BackendReport[] }>(
        "/api/reports"
      );
      return response.reports
        .map((r, index): Report | null => {
          const reportId = r.report_id || r.reportId;
          if (!reportId) {
            console.error(`❌ User own report ${index} missing report_id`);
            return null;
          }
          return {
            id: index + 1,
            date: new Date(r.created_at).toISOString().split("T")[0],
            keywords: r.keywords || [],
            user: "current_user",
            categories: toCategory(r.parameters?.data_type),
            reportLink: r.report_link || r.reportLink,
            reportId: reportId,
          };
        })
        .filter((r): r is Report => r !== null);
    } catch (error) {
      console.error("❌ Error fetching user reports:", error);
      return [];
    }
  },

  async downloadReport(searchId: string): Promise<void> {
    try {
      if (!searchId || searchId === "undefined" || searchId === "null") {
        throw new Error("Invalid search ID");
      }
      const response = await fetch(
        `${API_BASE_URL}/api/download-report/${searchId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error response:", errorText);
        throw new Error(
          `Failed to download report: ${response.status} - ${errorText}`
        );
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${searchId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      console.log("✅ Download successful!");
    } catch (error) {
      console.error("❌ Error downloading report:", error);
      throw error;
    }
  },

  async fetchReportBlob(searchId: string): Promise<Blob> {
    console.log("👁️ Attempting to view report:", searchId);
    if (!searchId || searchId === "undefined" || searchId === "null") {
      throw new Error("Invalid search ID");
    }
    const response = await fetch(
      `${API_BASE_URL}/api/download-report/${searchId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    return await response.blob();
  },
};
