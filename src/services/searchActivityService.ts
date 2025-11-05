import type { SearchActivity, Category } from "../types";

const ACTIVITY_KEY = "user_search_activities";

export const searchActivityService = {
  saveActivity(userId: string, username: string, keywords: string[], categories: Category[]): void {
    const activities = this.getAllActivities();
    
    const newActivity: SearchActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      username,
      date: new Date().toISOString().split("T")[0],
      keywords,
      categories,
      timestamp: Date.now(),
    };

    activities.push(newActivity);
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities));
  },

  getAllActivities(): SearchActivity[] {
    try {
      const stored = localStorage.getItem(ACTIVITY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  getActivitiesFiltered(username?: string, fromDate?: string, toDate?: string): SearchActivity[] {
    let activities = this.getAllActivities();

    if (username && username !== "All Users") {
      activities = activities.filter(a => a.username === username);
    }

    if (fromDate) {
      activities = activities.filter(a => a.date >= fromDate);
    }

    if (toDate) {
      activities = activities.filter(a => a.date <= toDate);
    }

    return activities.sort((a, b) => b.timestamp - a.timestamp);
  },

  clearAllActivities(): void {
    localStorage.removeItem(ACTIVITY_KEY);
  },
};
