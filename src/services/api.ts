import type { SearchResult, Category } from "../types";

// Dummy API - Replace this entire file with your real API calls
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
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 700));

    // Mock data with categories (50 items total for pagination demo)
    const allResults: SearchResult[] = Array.from({ length: 50 }, (_, i) => {
      const categories: Category[] = ["News", "Articles", "Papers"];
      const cat = categories[i % 3];
      
      return {
        id: i + 1,
        title: `${cat} ${i + 1}: AI ${["Technology", "Research", "Application", "Innovation"][i % 4]} Topic`,
        desc: `Detailed description for ${cat.toLowerCase()} item ${i + 1}. This is a comprehensive overview exploring various aspects of artificial intelligence and its applications in modern technology.`,
        cta: cat === "News" ? "Read News" : cat === "Papers" ? "Access Paper" : "View Article",
        category: cat,
      };
    });

    // Filter by category
    let filtered = category === "All" 
      ? allResults 
      : allResults.filter((r) => r.category === category);

    // Filter by query (simple contains check)
    if (query.trim()) {
      filtered = filtered.filter((r) =>
        r.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Paginate
    const start = (page - 1) * limit;
    const end = start + limit;
    const results = filtered.slice(start, end);

    return {
      results,
      total: filtered.length,
      page,
      totalPages: Math.ceil(filtered.length / limit),
    };
  },
};
