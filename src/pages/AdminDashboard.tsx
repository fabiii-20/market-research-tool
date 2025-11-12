import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { Report } from "../types";
import { reportAPI } from "../services/reportApi";
import { authService } from "../services/authService";
import UserManagement from "../components/admin/UserManagement";

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<"reports" | "users">("reports");
  const [reports, setReports] = useState<Report[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [reportsGenerated, setReportsGenerated] = useState<number>(0);
  const [selectedUser, setSelectedUser] = useState<string>("All Users");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);
  const [viewReport, setViewReport] = useState<Report | null>(null);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsTotalPages, setReportsTotalPages] = useState(0);
  const [reportsTotal, setReportsTotal] = useState(0);
  const [userNames, setUserNames] = useState<string[]>(["All Users"]);
  const [userIdMap, setUserIdMap] = useState<Record<string, string>>({});

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Get email from currentUser
  const currentUserStr = localStorage.getItem("currentUser");
  let email = "admin@example.com";
  let username = "Admin";

  if (currentUserStr) {
    try {
      const currentUser = JSON.parse(currentUserStr);
      email = currentUser.email || "admin@example.com";
      username = currentUser.username || "Admin";
    } catch (e) {
      console.error("Error parsing currentUser:", e);
    }
  }

  const firstLetter = email.charAt(0).toUpperCase();

  // Close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load data when filters change
  useEffect(() => {
    if (activeTab === "reports") {
      loadReports();
    }
  }, [activeTab, selectedUser, fromDate, toDate, reportsPage]);

  // Load user names for dropdown
  useEffect(() => {
    loadUserNames();
  }, []);

  const loadUserNames = async () => {
    try {
      const data = await authService.getAllUsers();
      const filteredUsers = data.users.filter((u) => u.role === "user");
      
      // Build email -> ID mapping
      const idMap: Record<string, string> = {};
      filteredUsers.forEach(u => {
        idMap[u.username] = u.id;
      });
      setUserIdMap(idMap);
      
      setUserNames(["All Users", ...filteredUsers.map((u) => u.username)]);
    } catch (error) {
      console.error("Error loading user names:", error);
    }
  };

const loadReports = async () => {
  try {
    setLoading(true);

    // Convert email to user ID
    let userIdToUse = selectedUser;
    
    if (selectedUser !== "All Users" && selectedUser !== "all") {
      userIdToUse = userIdMap[selectedUser] || selectedUser;
    }

    // ✅ Use NEW endpoint instead of getAdminReports
    const data = await reportAPI.getAdminSearchResults(
      userIdToUse === "All Users" ? "all" : userIdToUse,
      reportsPage,
      10,
      fromDate,
      toDate
    );
    
    setReports(data.reports);
    setReportsTotalPages(data.totalPages);
    setReportsTotal(data.total);
    setTotalUsers(data.totalUsers);
    setReportsGenerated(data.reportsGenerated);
  } catch (error) {
    console.error("❌ Error loading reports:", error);
  } finally {
    setLoading(false);
  }
};

  const handleFilter = () => {
    setReportsPage(1);
    loadReports();
  };

  const handleUserSelect = (user: string) => {
    setSelectedUser(user);
    setDropdownOpen(false);
    setReportsPage(1);
  };

  const onViewReport = async (report: Report) => {
    try {
      if (!report.reportId) {
        alert("Report ID is missing. Cannot view report.");
        return;
      }
      const blob = await reportAPI.fetchReportBlob(report.reportId);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setViewReport(report);
    } catch (error) {
      console.error("Error fetching report PDF blob:", error);
      alert("Failed to load report PDF.");
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      if (!reportId) {
        alert("Report ID is missing.");
        return;
      }
      await reportAPI.downloadReport(reportId);
    } catch (error) {
      console.error("❌ Download failed:", error);
      alert("Failed to download report. Please try again.");
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-4 px-4 pb-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg ring-1 ring-gray-700 text-gray-300 hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Previous
        </button>
        
        <span className="text-gray-400 text-sm">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg ring-1 ring-gray-700 text-gray-300 hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1a1d3e] flex flex-col md:flex-row">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm">
          <svg
            className="animate-spin h-12 w-12 text-indigo-400 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          <span className="text-lg text-white font-medium">
            Loading details...
          </span>
        </div>
      )}

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-[#242850] px-4 py-3 border-b border-gray-700/50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="h-10 w-10 rounded-lg bg-indigo-600 grid place-items-center hover:bg-indigo-700 text-white text-lg font-bold"
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>
        <h1 className="text-white text-lg font-bold">Admin Panel</h1>
        <div className="w-10" />
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "fixed md:static inset-0 z-40" : "hidden md:flex"
        } ${
          sidebarOpen ? "w-full md:w-60" : "md:w-20"
        } bg-[#1a1d3e] border-r border-gray-700/50 flex flex-col transition-all duration-300`}
      >
        {/* Logo */}
        <div className="hidden md:flex p-6 items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-10 w-10 rounded-lg bg-indigo-600 grid place-items-center hover:bg-indigo-700 transition shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="12" cy="12" r="3" />
              <path
                d="M3 12h3M18 12h3M12 3v3M12 18v3"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
              />
            </svg>
          </button>

          {sidebarOpen && (
            <span className="text-white text-xl font-bold">Admin Panel</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 md:py-0 space-y-1">
          <button
            onClick={() => {
              setActiveTab("reports");
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition text-sm md:text-base ${
              activeTab === "reports"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:bg-gray-700/50"
            }`}
            title={!sidebarOpen ? "Dashboard" : ""}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
            {sidebarOpen && <span>Dashboard</span>}
          </button>

          <button
            onClick={() => {
              setActiveTab("users");
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition text-sm md:text-base ${
              activeTab === "users"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:bg-gray-700/50"
            }`}
            title={!sidebarOpen ? "Users" : ""}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            {sidebarOpen && <span>Users</span>}
          </button>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700/50 font-medium transition text-sm md:text-base"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-[#1a1d3e] border-b border-gray-700/50 px-4 sm:px-6 md:px-8 py-4 md:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              {activeTab === "reports" && "User Reports"}
              {activeTab === "users" && "User Management"}
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              {activeTab === "reports" && "Monitor user activity and reports"}
              {activeTab === "users" && "Manage user accounts"}
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button className="text-gray-400 hover:text-white p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 md:h-6 md:w-6"
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
                className="h-10 w-10 rounded-full overflow-hidden grid place-items-center transition-all hover:scale-105 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 shadow-lg shadow-yellow-500/30 ring-2 ring-yellow-300/50"
              >
                <span className="text-white text-lg font-bold">{firstLetter}</span>
              </button>

              {profileDropdownOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg z-50 min-w-[180px] py-2">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">{username}</p>
                    <p className="text-xs text-gray-500">{email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
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
        </header>

        {/* Content Area - Switch between tabs */}
        {activeTab === "users" ? (
          <UserManagement />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="px-4 sm:px-6 md:px-8 py-4 md:py-6 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-[#242850] rounded-xl md:rounded-2xl p-4 md:p-6 flex items-center gap-4 md:gap-6">
                <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl bg-indigo-600/20 grid place-items-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 md:h-8 md:w-8 text-indigo-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">
                    Logged-In Users
                  </p>
                  <p className="text-white text-2xl md:text-3xl font-bold">
                    {totalUsers}
                  </p>
                </div>
              </div>

              <div className="bg-[#242850] rounded-xl md:rounded-2xl p-4 md:p-6 flex items-center gap-4 md:gap-6">
                <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl bg-emerald-600/20 grid place-items-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 md:h-8 md:w-8 text-emerald-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">
                    Reports Generated
                  </p>
                  <p className="text-white text-2xl md:text-3xl font-bold">
                    {reportsGenerated}
                  </p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="px-4 sm:px-6 md:px-8 py-3 md:py-4 bg-[#242850] mx-4 sm:mx-6 md:mx-8 rounded-xl md:rounded-2xl flex flex-col md:flex-row flex-wrap items-start md:items-center gap-2 md:gap-4">
              <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 md:h-5 md:w-5 text-gray-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-gray-400 text-xs md:text-sm shrink-0">
                    From:
                  </span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="flex-1 sm:flex-none bg-[#1a1d3e] text-white px-2 md:px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs md:text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-gray-400 text-xs md:text-sm shrink-0">
                    To:
                  </span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="flex-1 sm:flex-none bg-[#1a1d3e] text-white px-2 md:px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs md:text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={handleFilter}
                  className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-4 md:px-6 py-2 rounded-lg font-medium text-xs md:text-sm"
                >
                  Filter
                </button>

                {(fromDate || toDate || selectedUser !== "All Users") && (
                  <button
                    onClick={() => {
                      setFromDate("");
                      setToDate("");
                      setSelectedUser("All Users");
                      setReportsPage(1);
                    }}
                    className="text-gray-400 hover:text-white text-xs md:text-sm underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Reports Table */}
            <div className="px-4 sm:px-6 md:px-8 py-4 md:py-6 flex-1 overflow-auto">
              <div className="bg-[#242850] rounded-xl md:rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="px-4 sm:px-6 py-3 md:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-gray-700/50">
                  <h2 className="text-sm md:text-lg font-semibold text-white">
                    Generated Reports {reportsTotal > 0 && `(${reportsTotal})`}
                  </h2>

                  {/* User Select Dropdown */}
                  <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-full sm:w-auto flex items-center gap-2 bg-[#1a1d3e] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700/50 text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline text-gray-400">
                        Filter by:
                      </span>
                      <span className="truncate flex-1 sm:flex-none">
                        {selectedUser}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform shrink-0 ${
                          dropdownOpen ? "rotate-180" : ""
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                        />
                      </svg>
                    </button>

                    {dropdownOpen && (
                      <div className="absolute top-full mt-2 right-0 w-full sm:w-56 bg-[#1a1d3e] rounded-xl border border-gray-700 shadow-xl z-50 py-1 max-h-64 overflow-y-auto">
                        {userNames.map((user) => (
                          <button
                            key={user}
                            onClick={() => handleUserSelect(user)}
                            className={`w-full text-left px-3 sm:px-4 py-2 hover:bg-indigo-600/20 text-xs sm:text-sm ${
                              selectedUser === user
                                ? "bg-indigo-600/20 text-indigo-400"
                                : "text-gray-300"
                            }`}
                          >
                            {user}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Table or Empty State */}
                {reports.length === 0 ? (
                  <div className="p-6 sm:p-8 md:p-12 text-center text-gray-400">
                    <p className="text-sm sm:text-base md:text-lg font-semibold mb-2">
                      No reports found
                    </p>
                    <p className="text-xs sm:text-sm">
                      Try adjusting the filters
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-max">
                        <thead className="bg-[#1a1d3e] border-b border-gray-700/50">
                          <tr>
                            <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-medium text-gray-400 uppercase">
                              DATE
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-medium text-gray-400 uppercase">
                              KEYWORDS
                            </th>
                            <th className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-medium text-gray-400 uppercase">
                              USER
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-medium text-gray-400 uppercase">
                              CATEGORIES
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-medium text-gray-400 uppercase">
                              ACTIONS
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                          {reports.map((report) => (
                            <tr key={report.id} className="hover:bg-gray-700/20">
                              <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-white">
                                {report.date}
                              </td>
                              
                              {/* Keywords as badges */}
                              <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
                                <div className="flex flex-wrap gap-1">
                                  {report.keywords.map((kw, i) => (
                                    <span 
                                      key={i}
                                      className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                                    >
                                      {kw}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              
                              <td className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-white">
                                {report.user}
                              </td>
                              
                              {/* Categories as badges */}
                              <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
                                <div className="flex flex-wrap gap-1">
                                  {report.categories && report.categories.length > 0 ? (
                                    report.categories.map((cat, i) => (
                                      <span
                                        key={i}
                                        className="inline-block px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs"
                                      >
                                        {cat}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-gray-500">N/A</span>
                                  )}
                                </div>
                              </td>
                              
                              {/* Actions */}
                              <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <button
                                    onClick={() => onViewReport(report)}
                                    disabled={!report.reportId}
                                    className="text-indigo-400 hover:text-indigo-300 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="View Report"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 sm:h-5 sm:w-5"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                    >
                                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDownloadReport(report.reportId || "")}
                                    disabled={!report.reportId}
                                    className="text-emerald-400 hover:text-emerald-300 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Download Report"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 sm:h-5 sm:w-5"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                    >
                                      <path d="M12 16l-5-5h3V4h4v7h3l-5 5zM5 20v-2h14v2H5z" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <PaginationControls
                      currentPage={reportsPage}
                      totalPages={reportsTotalPages}
                      onPageChange={setReportsPage}
                    />
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* View Report Modal */}
      {viewReport && pdfUrl && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#2d2b3e] rounded-lg w-[90vw] max-w-4xl max-h-[90vh] overflow-auto relative shadow-lg">
            <button
              onClick={() => {
                setViewReport(null);
                setPdfUrl(null);
              }}
              className="absolute top-3 right-3 text-white text-xl hover:text-red-400"
              aria-label="Close report modal"
            >
              &times;
            </button>

            <iframe
              src={pdfUrl}
              title="Report PDF Viewer"
              className="w-full h-[80vh] rounded-b-lg"
              frameBorder="0"
            />
          </div>
        </div>
      )}
    </div>
  );
}
