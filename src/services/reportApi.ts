import type { Report, Category } from "../types";
import { apiRequest, API_BASE_URL } from "./apiClient";

interface AnalyticsResponse {
  total_reports: number;
  total_users: number;
}

interface BackendReport {
  report_id: string;
  created_at: string;
  keywords: string[];
  parameters?: {
    data_type?: string | string[];
    [key: string]: unknown;
  };
  report_link?: string;
}

interface ReportsResponse {
  reports: BackendReport[];
}

interface AnalyticsRequestBody {
  date_filter: boolean;
  from_date?: string;
  to_date?: string;
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

const toCategory = (dataType?: string | string[]): Category[] => {
  if (!dataType) return [];
  
  // Handle both string and array
  const types = Array.isArray(dataType) ? dataType : [dataType];
  
  const mapping: Record<string, Category> = {
    news: "News",
    article: "Articles",
    research: "Papers",
  };
  
  const categories: Category[] = [];
  
  for (const type of types) {
    if (typeof type === 'string') {
      const category = mapping[type.toLowerCase()];
      if (category) {
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

  async getReports(
    userId: string = "all",
    fromDate?: string,
    toDate?: string
  ): Promise<{
    reports: Report[];
    totalUsers: number;
    reportsGenerated: number;
  }> {
    try {
      // console.log("📊 Getting reports for:", userId);

      // Get analytics first
      const analytics = await this.getAnalytics(
        !!(fromDate || toDate),
        fromDate,
        toDate
      );

      // Handle "All Users" case
      if (userId === "All Users" || userId === "all") {
        // console.log("📊 Fetching all users' reports...");

        // Get all users
        const usersResponse = await apiRequest<{ users: BackendUser[] }>("/api/admin/users");
        // console.log("👥 Users found:", usersResponse.users.length);
        // console.log("👥 Users data:", usersResponse.users);

        const allReports: Report[] = [];

        // Fetch reports for each user
        for (const user of usersResponse.users) {
          try {
            const userIdToUse = user.id;
            
            if (!userIdToUse) {
              console.warn(`⚠️ User ${user.email} has no ID, skipping...`);
              continue;
            }
            
            // console.log(`📊 Fetching reports for user ID: ${userIdToUse} (${user.email})`);
            
            const userReportsResponse = await apiRequest<ReportsResponse>(
              `/api/admin/reports/${userIdToUse}`
            );

            // console.log(`✅ Found ${userReportsResponse.reports.length} reports for user ${userIdToUse}`);

            const userReports: Report[] = userReportsResponse.reports.map((r, index): Report => ({
              id: allReports.length + index + 1,
              date: new Date(r.created_at).toISOString().split("T")[0],
              keywords: r.keywords || [],
              user: user.email || user.username,
              categories: toCategory(r.parameters?.data_type),
              report_link: r.report_link,
              report_id: r.report_id,
            }));

            allReports.push(...userReports);
          } catch (error) {
            console.warn(`⚠️ Failed to fetch reports for user ${user.id} (${user.email}):`, error);
          }
        }

        // console.log(`✅ Total reports fetched: ${allReports.length}`);

        return {
          reports: allReports,
          totalUsers: analytics.totalUsers,
          reportsGenerated: analytics.reportsGenerated,
        };
      }

      // Single user
      // console.log(`📊 Fetching reports for single user: ${userId}`);
      
      let userIdToUse = userId;
      if (userId.includes("@") || isNaN(Number(userId))) {
        // console.log("📧 Converting email/username to numeric ID...");
        try {
          const usersResponse = await apiRequest<{ users: BackendUser[] }>("/api/admin/users");
          const user = usersResponse.users.find(u => u.email === userId || u.username === userId);
          if (user && user.id) {
            userIdToUse = user.id;
            // console.log(`✅ Found numeric ID: ${userIdToUse}`);
          }
        } catch (error) {
          console.warn("Could not fetch users to find numeric ID:", error);
        }
      }
      
      const response = await apiRequest<ReportsResponse>(
        `/api/admin/reports/${userIdToUse}`
      );

      const reports: Report[] = response.reports.map((r, index): Report => ({
        id: index + 1,
        date: new Date(r.created_at).toISOString().split("T")[0],
        keywords: r.keywords || [],
        user: userId,
        categories: toCategory(r.parameters?.data_type),
        report_link: r.report_link,
        report_id: r.report_id,
      }));

      // console.log(`✅ Found ${reports.length} reports for user ID ${userIdToUse}`);

      return {
        reports,
        totalUsers: analytics.totalUsers,
        reportsGenerated: analytics.reportsGenerated,
      };
    } catch (error) {
      console.error("❌ Error fetching reports:", error);
      return { reports: [], totalUsers: 0, reportsGenerated: 0 };
    }
  },

  // ✅ NEW: Fetch current user's own reports using /api/reports
 async getUserOwnReports(): Promise<Report[]> {
  try {
    // console.log("📊 Fetching current user's reports...");

    const response = await apiRequest<{
      reports: BackendReport[];
    }>("/api/reports");

    console.log(`✅ User reports fetched: ${response.reports.length}`);

    return response.reports.map((r, index): Report => ({
      id: index + 1,
      date: new Date(r.created_at).toISOString().split("T")[0],
      keywords: r.keywords || [],
      user: "current_user",
      categories: toCategory(r.parameters?.data_type),
      report_link: r.report_link,
      report_id: r.report_id,
    }));
  } catch (error) {
    console.error("❌ Error fetching user reports:", error);
    return [];
  }
},

  async downloadReport(reportId: string): Promise<void> {
    try {
      // console.log("📥 Downloading report:", reportId);
      // console.log("🔑 Using token:", localStorage.getItem("auth_token"));
      
      const response = await fetch(
        `${API_BASE_URL}/api/download-report/${reportId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      // console.log("📥 Response status:", response.status);
      // console.log("📥 Response headers:", response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error response:", errorText);
        throw new Error(`Failed to download report: ${response.status} - ${errorText}`);
      }

      const blob = await response.blob();
      // console.log("📥 Blob size:", blob.size, "bytes");
      // console.log("📥 Blob type:", blob.type);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${reportId}.pdf`;
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

  async fetchReportBlob(reportId: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/download-report/${reportId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    },
  });
  if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`);
  return await response.blob();
}

};
