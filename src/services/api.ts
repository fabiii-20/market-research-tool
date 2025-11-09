import type { SearchResult, Category } from "../types";
import { apiRequest } from "./apiClient";

interface SearchRequest {
  data_type: string[];
  keywords: string[];
}

interface SearchResponse {
  status: string;
  data: Array<{
    topic: string;
    summary: string;
    link: string;
  }>;
  report_id?: string; // Backend may or may not return this
}

export const searchAPI = {
  async search(
    query: string,
    category: Category = "All",
    page: number = 1,
    limit: number = 4
  ): Promise<{
    results: SearchResult[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const keywords = query
        .trim()
        .split(/\s+/)
        .filter((k) => k.length > 0);

      if (keywords.length === 0) {
        return { results: [], total: 0, page: 1, totalPages: 0 };
      }

      const dataTypes: string[] = [];
      if (category === "All" || category === "News") dataTypes.push("news");
      if (category === "All" || category === "Articles") dataTypes.push("article");
      if (category === "All" || category === "Papers") dataTypes.push("research");

      const requestBody: SearchRequest = {
        data_type: dataTypes,
        keywords: keywords,
      };

      const response = await apiRequest<SearchResponse>("/api/get-data", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      // ✅ ADD THIS LINE TO SEE FULL RESPONSE
      // console.log("📊 Full API Response from /api/get-data:", response);
      // console.log("📊 Response keys:", Object.keys(response));
      
      // Check if report_id exists
      // if ('report_id' in response) {
      //   console.log("✅ REPORT_ID FOUND:", response.report_id);
      // } else {
      //   console.log("❌ NO report_id in response");
      // }

      if (response.status !== "success") {
        throw new Error("Search failed");
      }

      const allResults: SearchResult[] = response.data.map((item, index) => ({
        id: index + 1,
        title: item.topic,
        desc: item.summary,
        link: item.link,
        category: category === "All" ? "News" : category,
      }));

      const total = allResults.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const end = start + limit;
      const results = allResults.slice(start, end);

      return {
        results,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      console.error("Search error:", error);
      throw error;
    }
  },
};
