import type { Report } from "../types";
import { searchActivityService } from "./searchActivityService";
import { authService } from "./authService";

export const reportAPI = {
  async getReports(
    user: string = "All Users",
    fromDate?: string,
    toDate?: string
  ): Promise<{
    reports: Report[];
    totalUsers: number;
    reportsGenerated: number;
  }> {
    await new Promise((r) => setTimeout(r, 500));

    // Get real search activities from localStorage
    const activities = searchActivityService.getActivitiesFiltered(user, fromDate, toDate);

    // Convert activities to reports
    const reports: Report[] = activities.map((activity) => ({
      id: parseInt(activity.id.split("-")[1]) || Math.random(),
      date: activity.date,
      keywords: activity.keywords,
      user: activity.username,
      categories: activity.categories,
    }));

    // Get user count
    const allUsers = authService.getAllUsers().filter(u => u.role === "user");

    return {
      reports,
      totalUsers: allUsers.length,
      reportsGenerated: activities.length,
    };
  },

  async downloadReport(reportId: number): Promise<void> {
    await new Promise((r) => setTimeout(r, 300));
    console.log(`Downloading report ${reportId}...`);
    alert(`Report ${reportId} download started!`);
  },
};
