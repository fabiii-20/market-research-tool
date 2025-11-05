import type { Report } from "../types";
import { userService } from "./userService";

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

    // TODO: Replace with actual API call when backend is ready
    // const response = await fetch(`/api/reports?user=${user}&from=${fromDate}&to=${toDate}`);
    // const data = await response.json();
    // return data;

    // Get actual logged-in users
    const loggedUsers = userService.getLoggedUsers();
    const userNames = loggedUsers.map((u) => u.name || u.email);

    // Generate reports based on actual users
    const allReports: Report[] = [];
    let reportId = 1;

    loggedUsers.forEach((user, idx) => {
      // Generate 2-3 reports per user
      const reportCount = Math.floor(Math.random() * 2) + 2;
      
      for (let i = 0; i < reportCount; i++) {
        const daysAgo = Math.floor(Math.random() * 60); // Random date in last 60 days
        const reportDate = new Date();
        reportDate.setDate(reportDate.getDate() - daysAgo);
        
        const keywords = [
          ["customer churn", "retention rate"],
          ["market trends", "competitor analysis"],
          ["user engagement", "feature adoption"],
          ["sales performance", "regional growth"],
          ["social media sentiment"],
          ["product analytics", "conversion rate"],
          ["customer feedback", "NPS score"],
          ["revenue forecast", "growth metrics"],
        ];
        
        const parameters = [
          "Q3 Analysis, High Priority",
          "Global, 2025 Forecast",
          "Mobile App, Last 30 days",
          "APAC Region, Q3 vs Q2",
          "Brand Mentions, October",
          "E-commerce, Q3 Summary",
          "Survey Results, Q3",
          "Financial Planning, Q4",
        ];

        allReports.push({
          id: reportId++,
          date: reportDate.toISOString().split("T")[0],
          keywords: keywords[Math.floor(Math.random() * keywords.length)],
          user: user.name || user.email,
          parameters: parameters[Math.floor(Math.random() * parameters.length)],
        });
      }
    });

    // Sort by date descending
    allReports.sort((a, b) => b.date.localeCompare(a.date));

    // Filter by user
    let filtered = user === "All Users" ? allReports : allReports.filter((r) => r.user === user);

    // Filter by date range
    if (fromDate) {
      filtered = filtered.filter((r) => r.date >= fromDate);
    }
    if (toDate) {
      filtered = filtered.filter((r) => r.date <= toDate);
    }

    return {
      reports: filtered,
      totalUsers: loggedUsers.length,
      reportsGenerated: allReports.length,
    };
  },
};
