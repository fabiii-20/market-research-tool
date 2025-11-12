import type { 
  SearchResult, 
  Category, 
  PaginatedResponse, 
  ResearchDataItem, 
  SearchRequest, 
  GetDataResponse 
} from "../types";
import { apiRequest } from "./apiClient";

// Helper function to generate unique search_id
const generateSearchId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `search_${timestamp}_${random}`;
};

// Helper function to map data_type to Category
const mapDataTypeToCategory = (dataType: string): Category => {
  const mapping: Record<string, Category> = {
    news: "News",
    article: "Articles",
    research: "Papers",
  };
  return mapping[dataType] || "News";
};

export const searchAPI = {

  async search(
    query: string,
    selectedCategories: Category[] = ["All"], 
    page: number = 1,
    limit: number = 4
  ): Promise<{
    results: SearchResult[];
    total: number;
    page: number;
    totalPages: number;
    searchId: string;
  }> {
    try {
      const keywords = query.trim().split(/\s+/).filter((k) => k.length > 0);
      if (keywords.length === 0) {
        return { results: [], total: 0, page: 1, totalPages: 0, searchId: "" };
      }

      // Convert selected categories to backend data_type array
      const dataTypes: string[] = [];
      
      if (selectedCategories.includes("All")) {
        dataTypes.push("news", "article", "research");
      } else {
        if (selectedCategories.includes("News")) dataTypes.push("news");
        if (selectedCategories.includes("Articles")) dataTypes.push("article");
        if (selectedCategories.includes("Papers")) dataTypes.push("research");
      }

      // Fallback to all if none selected
      if (dataTypes.length === 0) {
        dataTypes.push("news", "article", "research");
      }

      // STEP 1: Initiate search with search_id
      const searchId = generateSearchId();
      const searchRequest: SearchRequest = {
        search_id: searchId,
        keywords: keywords,
        data_type: dataTypes, // Array sent to backend
      };

      const getDataResponse = await apiRequest<GetDataResponse>("/api/get-data", {
        method: "POST",
        body: JSON.stringify(searchRequest),
      });
      console.log(JSON.stringify(searchRequest))

      if (getDataResponse.status !== "success") {
        throw new Error(getDataResponse.message || "Failed to initiate search");
      }

      // STEP 2: Fetch results
      // ✅ Only use data_type filter for single category (not "All")
      const dataTypeFilter = 
        selectedCategories.includes("All") || selectedCategories.length > 1
          ? undefined 
          : dataTypes[0];
      
      const resultsResponse = await apiRequest<PaginatedResponse<ResearchDataItem>>(
        `/api/search-results/${searchId}?page=${page}&page_size=${limit}${dataTypeFilter ? `&data_type=${dataTypeFilter}` : ""}`,
        { method: "GET" }
      );

      // Transform results...
      const results: SearchResult[] = resultsResponse.data.map((item, index) => ({
        id: (page - 1) * limit + index + 1,
        title: item.topic,
        desc: item.summary,
        link: item.link,
        category: mapDataTypeToCategory(item.data_type),
        data_type: item.data_type,
      }));

      return {
        results,
        total: resultsResponse.total,
        page: resultsResponse.page,
        totalPages: resultsResponse.total_pages,
        searchId: searchId,
      };
    } catch (error) {
      console.error("Search error:", error);
      throw error;
    }
  },


  async fetchSearchResults(
    searchId: string,
    selectedCategories: Category[] = ["All"], // ✅ Array
    page: number = 1,
    pageSize: number = 4
  ) {
    // Only filter if single category (not "All")
    const dataTypeFilter = 
      selectedCategories.includes("All") || selectedCategories.length > 1
        ? undefined
        : (() => {
            if (selectedCategories.includes("News")) return "news";
            if (selectedCategories.includes("Articles")) return "article";
            if (selectedCategories.includes("Papers")) return "research";
            return undefined;
          })();
    
    const dataTypeParam = dataTypeFilter ? `&data_type=${dataTypeFilter}` : "";
    
    const response = await apiRequest<PaginatedResponse<ResearchDataItem>>(
      `/api/search-results/${searchId}?page=${page}&page_size=${pageSize}${dataTypeParam}`,
      { method: "GET" }
    );

    // Transform results...
    const results: SearchResult[] = response.data.map((item, index) => ({
      id: (page - 1) * pageSize + index + 1,
      title: item.topic,
      desc: item.summary,
      link: item.link,
      category: mapDataTypeToCategory(item.data_type),
      data_type: item.data_type,
    }));

    return {
      results,
      total: response.total,
      page: response.page,
      totalPages: response.total_pages,
    };
  },
};

