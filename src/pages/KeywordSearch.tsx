import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { SearchResult, Category } from "../types";
import { searchAPI } from "../services/api";
import { authService } from "../services/authService";
import { searchActivityService } from "../services/searchActivityService";


export default function KeywordSearchPage() {
  const navigate = useNavigate();
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(["All"]);
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState<boolean>(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

 const fetchResults = async (page: number = 1) => {
  if (keywords.length === 0) return;

  setLoading(true);
  setHasSearched(true);

  // ✅ SAVE SEARCH ACTIVITY ONLY ON FIRST PAGE
  if (page === 1) {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      searchActivityService.saveActivity(
        currentUser.id,
        currentUser.username,
        keywords,
        selectedCategories
      );
    }
  }

  try {
    const categoryToSearch = selectedCategories.includes("All") ? "All" : selectedCategories[0];
    const data = await searchAPI.search(keywords.join(" "), categoryToSearch, page, 4);
    
    setItems(data.results);
    setTotal(data.total);
    setTotalPages(data.totalPages);
    setCurrentPage(page);
  } catch (error) {
    console.error("Search failed:", error);
    setItems([]);
  } finally {
    setLoading(false);
  }
};


  const handleAddKeyword = () => {
    if (currentKeyword.trim() && !keywords.includes(currentKeyword.trim())) {
      setKeywords([...keywords, currentKeyword.trim()]);
      setCurrentKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleGetData = () => {
    setCurrentPage(1);
    fetchResults(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchResults(page);
  };

  const handleCategoryToggle = (cat: Category) => {
    if (cat === "All") {
      setSelectedCategories(["All"]);
    } else {
      let newCategories = selectedCategories.filter((c) => c !== "All");
      if (newCategories.includes(cat)) {
        newCategories = newCategories.filter((c) => c !== cat);
      } else {
        newCategories.push(cat);
      }
      setSelectedCategories(newCategories.length === 0 ? ["All"] : newCategories);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddKeyword();
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push("...");
      }
      
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  const categories: Category[] = ["All", "News", "Articles", "Papers"];
  const categoryDisplay = selectedCategories.includes("All") ? "All Categories" : selectedCategories.join(", ");

  return (
    <div className="min-h-screen bg-[#1e1c2b]">
      {/* Top bar */}
      <header className="px-6 md:px-10 py-5">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white/5 ring-1 ring-white/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-indigo-600 grid place-items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="7" strokeWidth="2" />
                <path d="m21 21-4.3-4.3" strokeWidth="2" />
              </svg>
            </div>
            <h1 className="text-white text-lg font-semibold">
              Keyword Search Tool
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-white hover:text-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            
            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="h-8 w-8 rounded-full bg-white/20 overflow-hidden grid place-items-center hover:bg-white/30 transition"
              >
                <span className="text-white text-xs">👤</span>
              </button>
              
              {profileDropdownOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg z-50 min-w-[150px] py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
  <polyline points="16 17 21 12 16 7" />
  <line x1="21" y1="12" x2="9" y2="12" />
</svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* App card */}
      <main className="px-6 md:px-10 pb-10">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          {/* Search row */}
      {/* Search row */}
<div className="p-6 md:p-8">
  <div className="flex flex-col lg:flex-row gap-3">
    <div className="flex-1">
      <div className="rounded-xl ring-1 ring-gray-200 bg-white px-4 py-3 min-h-[54px] flex flex-wrap items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-400 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="11" cy="11" r="7" strokeWidth="2" />
          <path d="m21 21-4.3-4.3" strokeWidth="2" />
        </svg>
        
        {/* Keywords Tags Inside */}
        {keywords.map((kw) => (
          <div key={kw} className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-sm">
            "{kw}"
            <button
              onClick={() => handleRemoveKeyword(kw)}
              className="hover:opacity-70 ml-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" stroke="currentColor" />
              </svg>
            </button>
          </div>
        ))}
        
        <input
          value={currentKeyword}
          onChange={(e) => setCurrentKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={keywords.length === 0 ? "Enter your keywords and press Enter" : "Add another keyword..."}
          className="flex-1 min-w-[200px] bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
        />
      </div>
    </div>

    <div className="flex items-start gap-3">
      {/* Category Dropdown */}
      <div className="relative" ref={categoryDropdownRef}>
        <button
          onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
          className="h-[54px] whitespace-nowrap inline-flex items-center gap-2 rounded-xl ring-1 ring-gray-200 px-4 text-gray-700 hover:bg-gray-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-indigo-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M4 5h16v2H4zM7 11h10v2H7zM10 17h4v2h-4z" />
          </svg>
          <span className="font-medium text-sm">{categoryDisplay}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-gray-400 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
          </svg>
        </button>

        {categoryDropdownOpen && (
          <div className="absolute top-full mt-2 left-0 w-56 bg-white rounded-xl ring-1 ring-gray-200 shadow-lg z-50 py-2 max-h-64 overflow-y-auto">
            {categories.map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => handleCategoryToggle(cat)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-gray-700">
                  {cat === "All" ? "All Categories" : cat}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleGetData}
        disabled={keywords.length === 0}
        className="h-[54px] whitespace-nowrap inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path d="M12 5v14M5 12h14" strokeWidth="2" />
        </svg>
        <span className="font-semibold">Get Data</span>
      </button>
    </div>
  </div>
</div>

          {hasSearched && (
            <>
              <hr className="border-gray-100" />

              {/* Results header */}
              <div className="px-6 md:px-8 py-4 flex items-center justify-between">
                <h2 className="text-gray-800 font-semibold">
                  Search Results ({total} found)
                </h2>
                {items.length > 0 && (
                  <button className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M12 3v12m0 0l4-4m-4 4l-4-4M5 21h14"
                        strokeWidth="2"
                      />
                    </svg>
                    <span className="text-sm font-semibold">Download Report</span>
                  </button>
                )}
              </div>

              {/* Results list */}
              <div className="px-6 md:px-8 pb-6 space-y-4">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">
                    Loading results…
                  </div>
                ) : items.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No results found for "{keywords.join(", ")}" in {categoryDisplay.toLowerCase()}. Try another keyword.
                  </div>
                ) : (
                  items.map((r, idx) => (
                    <div
                      key={r.id}
                      onMouseEnter={() => setHoveredId(r.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`rounded-xl ring-1 px-5 py-5 bg-white transition-all duration-200 cursor-pointer ${
                        hoveredId === r.id
                          ? "ring-indigo-300 shadow-[0_10px_30px_rgba(79,70,229,0.08)]"
                          : "ring-gray-200"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="h-8 w-8 shrink-0 grid place-items-center rounded-full ring-1 ring-gray-300 text-indigo-600 font-semibold">
                          {(currentPage - 1) * 4 + idx + 1}.
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-gray-900 font-semibold">
                              {r.title}
                            </h3>
                            <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                              {r.category}
                            </span>
                          </div>
                          <p className="text-gray-500 mt-1">{r.desc}</p>
                          <div className="mt-3">
                            <button className="text-indigo-700 font-semibold inline-flex items-center gap-1 hover:underline">
                              {r.cta}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                              >
                                <path
                                  d="M5 12h14M13 5l7 7-7 7"
                                  strokeWidth="2"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {!loading && items.length > 0 && (
                <div className="px-6 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-b-2xl border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * 4 + 1} to{" "}
                    {Math.min(currentPage * 4, total)} of{" "}
                    <span className="font-semibold text-gray-700">{total}</span>{" "}
                    results
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-lg ring-1 ring-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {getPageNumbers().map((page, idx) =>
                      page === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                          …
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page as number)}
                          className={`px-3 py-2 rounded-lg ${
                            currentPage === page
                              ? "bg-indigo-600 text-white"
                              : "ring-1 ring-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-lg ring-1 ring-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Empty state */}
          {!hasSearched && (
            <div className="px-6 md:px-8 py-16 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="7" strokeWidth="2" />
                <path d="m21 21-4.3-4.3" strokeWidth="2" />
              </svg>
              <p className="text-gray-500 text-lg">
                Please enter a keyword and press <span className="font-semibold text-indigo-600">Get Data</span>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
