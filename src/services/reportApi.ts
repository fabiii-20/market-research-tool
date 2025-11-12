import type { Report, Category } from "../types";
import { apiRequest, API_BASE_URL } from "./apiClient";

interface AnalyticsResponse {
  total_reports: number;
  total_users: number;
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
      const body = { date_filter: dateFilter } as {
        date_filter: boolean;
        from_date?: string;
        to_date?: string;
      };
      if (fromDate) body.from_date = fromDate;
      if (toDate) body.to_date = toDate;

      const response = await apiRequest<AnalyticsResponse>("/api/admin/analytics", {
        method: "POST",
        body: JSON.stringify(body),
      });

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
    totalUsers: number;
    reportsGenerated: number;
  }> {
    try {
      const analytics = await this.getAnalytics(!!(fromDate || toDate), fromDate, toDate);

      let queryParams = `page=${page}&page_size=${pageSize}`;
      if (userId !== "all" && userId !== "All Users") {
        queryParams += `&user_id=${userId}`;
      }
      if (fromDate) queryParams += `&from_date=${fromDate}`;
      if (toDate) queryParams += `&to_date=${toDate}`;

      const response = await apiRequest<SearchResultsResponse>(`/api/admin/search-results?${queryParams}`);

      const reports: Report[] = response.searches.map((search, index) => ({
        id: (page - 1) * pageSize + index + 1,
        date: new Date(search.date).toISOString().split("T")[0],
        keywords: search.keywords || [],
        user:
          search.username ??
          search.email ??
          "user@example.com",
        username: search.username ?? "Unknown",
        categories: toCategory(search.data_types),
        reportLink: `/api/download-report/${search.search_id}`,
        reportId: search.search_id,
      }));

      return {
        reports,
        total: response.total,
        totalPages: response.total_pages,
        currentPage: response.page,
        totalUsers: analytics.totalUsers,
        reportsGenerated: analytics.reportsGenerated,
      };
    } catch (error) {
      console.error("❌ Error fetching search results:", error);
      return {
        reports: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
        totalUsers: 0,
        reportsGenerated: 0,
      };
    }
  },

  async downloadReport(searchId: string): Promise<void> {
    if (!searchId || searchId === "undefined" || searchId === "null") {
      throw new Error("Invalid search ID");
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/download-report/${searchId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error response:", errorText);
        throw new Error(`Failed to download report: ${response.status} - ${errorText}`);
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
    if (!searchId || searchId === "undefined" || searchId === "null") {
      throw new Error("Invalid search ID");
    }
    const response = await fetch(`${API_BASE_URL}/api/download-report/${searchId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    return await response.blob();
  },
};
