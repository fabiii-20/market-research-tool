import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { Report, UserAccount } from "../types";
import { reportAPI } from "../services/reportApi";
import { authService } from "../services/authService";

export default function AdminHome() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"reports" | "users">("reports");
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [reportsGenerated, setReportsGenerated] = useState<number>(0);
  const [selectedUser, setSelectedUser] = useState<string>("All Users");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [profileDropdownOpen, setProfileDropdownOpen] =
    useState<boolean>(false);
  const [viewReport, setViewReport] = useState<Report | null>(null);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ FIXED: Load data on mount and when dependencies change
  useEffect(() => {
    loadData();
  }, [activeTab, selectedUser, fromDate, toDate]);

  // ✅ FIXED: Proper loadData function
  const loadData = async () => {
    try {
      if (activeTab === "reports") {
        setLoading(true);

        const data = await reportAPI.getReports(selectedUser, fromDate, toDate);
        setLoading(false);

        setReports(data.reports);
        setTotalUsers(data.totalUsers);
        setReportsGenerated(data.reportsGenerated);
      } else if (activeTab === "users") {
        const allUsers = await authService.getAllUsers();

        setUsers(allUsers);
      }
    } catch (error) {
      console.error("❌ Error loading data:", error);
    }
  };

  const fetchReports = async () => {
    await loadData();
  };

  const handleFilter = () => {
    fetchReports();
  };

  const handleUserSelect = (user: string) => {
    setSelectedUser(user);
    setDropdownOpen(false);
  };

  const onViewReport = async (report: Report) => {
    try {
      if (!report.report_id) {
        alert("Report ID is missing.");
        return;
      }
      const blob = await reportAPI.fetchReportBlob(report.report_id);
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
      // console.log("📥 Admin downloading report:", reportId);
      await reportAPI.downloadReport(reportId);
      console.log("✅ Download successful");
    } catch (error) {
      console.error("❌ Download failed:", error);
      alert("Failed to download report. Please try again.");
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const handleAddUser = () => {
    setFormData({ username: "", email: "", password: "" });
    setFormError("");
    setEditingUser(null);
    setShowAddUserForm(true);
  };

  const handleEditUser = (user: UserAccount) => {
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
    });
    setFormError("");
    setEditingUser(user);
    setShowAddUserForm(true);
  };

 const handleSubmitForm = async () => {
  setFormError("");
  
  if (!formData.username.trim() || !formData.email.trim()) {
    setFormError("Username and email are required");
    return;
  }

  try {
    if (editingUser) {
      // Update existing user
      const updateData: { email?: string; password?: string } = {
        email: formData.email,
      };
      
      // Only include password if user entered a new one
      if (formData.password.trim()) {
        if (formData.password.length < 8) {
          setFormError("Password must be at least 8 characters");
          return;
        }
        updateData.password = formData.password;
      }
      
      const result = await authService.updateUser(editingUser.id, updateData);
      
      if (!result.success) {
        setFormError(result.message || "Failed to update user");
        return;
      }
      
      alert("User updated successfully!");
    } else {
      // Add new user
      if (!formData.password.trim()) {
        setFormError("Password is required for new users");
        return;
      }
      
      if (formData.password.length < 8) {
        setFormError("Password must be at least 8 characters");
        return;
      }
      
      const result = await authService.addUser(
        formData.username,
        formData.email,
        formData.password,
        "user"
      );
      
      if (!result.success) {
        setFormError(result.message || "Failed to add user");
        return;
      }
      
      alert("User added successfully!");
    }

    await loadData();
    setShowAddUserForm(false);
  } catch (error) {
    console.error("Error submitting form:", error);
    setFormError("An error occurred");
  }
};


  const handleToggleUserStatus = async (
    userId: string,
    currentStatus: "active" | "inactive"
  ) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await authService.changeUserStatus(userId, newStatus);
      await loadData();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  // ✅ FIXED: Get user names for dropdown
  const [userNames, setUserNames] = useState<string[]>(["All Users"]);

  useEffect(() => {
    const loadUserNames = async () => {
      const allUsers = await authService.getAllUsers();
      const filteredUsers = allUsers.filter((u) => u.role === "user");
      setUserNames(["All Users", ...filteredUsers.map((u) => u.email)]);
    };

    loadUserNames();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#1a1d3e] flex flex-col md:flex-row">
      {/* Mobile Header */}
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
          <span className="text-lg text-white font-medium">
            Loading details...
          </span>
        </div>
      )}

      <div className="md:hidden flex items-center justify-between bg-[#242850] px-4 py-3 border-b border-gray-700/50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="h-10 w-10 rounded-lg bg-indigo-600 grid place-items-center hover:bg-indigo-700 text-white text-lg font-bold"
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>
        <h1 className="text-white text-lg font-bold">DataView</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "fixed md:static inset-0 z-40" : "hidden md:flex"
        } ${
          sidebarOpen ? "w-full md:w-60" : "md:w-20"
        } bg-[#1a1d3e] border-r border-gray-700/50 flex flex-col transition-all duration-300`}
      >
        {/* Desktop Logo Section */}
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
            <span className="text-white text-xl font-bold">DataView</span>
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
              strokeLinecap="round"
              strokeLinejoin="round"
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
              {activeTab === "reports" ? "User Reports" : "User Management"}
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              {activeTab === "reports"
                ? "Monitor user activity and generate reports."
                : "Manage user accounts"}
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

           {/* Profile Dropdown in Admin Dashboard */}
<div className="relative" ref={profileDropdownRef}>
  <button
    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
    className="h-10 w-10 rounded-full overflow-hidden grid place-items-center transition-all hover:scale-105 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 shadow-lg shadow-yellow-500/30 ring-2 ring-yellow-300/50"
  >
    <span className="text-white text-lg font-bold">A</span>
  </button>

  {profileDropdownOpen && (
    <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg z-50 min-w-[180px] py-2">
      <div className="px-4 py-2 border-b border-gray-200">
        <p className="text-sm font-semibold text-gray-900">Admin</p>
        <p className="text-xs text-gray-500">Administrator</p>
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

        {/* Content */}
        {activeTab === "reports" ? (
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
                    onClick={async () => {
                      setFromDate("");
                      setToDate("");
                      setSelectedUser("All Users");

                      try {
                        const data = await reportAPI.getReports("All Users");
                        setReports(data.reports);
                      } catch (error) {
                        console.error(
                          "Error fetching all users' reports:",
                          error
                        );
                        alert("Failed to load reports. Please try again.");
                      }
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
                    Generated Reports{" "}
                    {reports.length > 0 && `(${reports.length})`}
                  </h2>

                  {/* User Select Dropdown */}
                  <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-full sm:w-auto flex items-center gap-2 bg-[#1a1d3e] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700/50 text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline text-gray-400">
                        Select:
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

                {/* Empty State or Table */}
                {reports.length === 0 ? (
                  <div className="p-6 sm:p-8 md:p-12 text-center text-gray-400">
                    {totalUsers === 0 ? (
                      <div>
                        <p className="text-sm sm:text-base md:text-lg font-semibold mb-2">
                          No users have logged in yet.
                        </p>
                        <p className="text-xs sm:text-sm">
                          User reports will appear here once users log in
                          through the user portal.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs sm:text-sm md:text-base">
                          No reports found for the selected filters.
                        </p>
                        <p className="text-xs sm:text-sm mt-2">
                          Try adjusting the date range or user.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
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
                            <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-400 max-w-[200px] truncate">
                              {report.keywords.map((kw, i) => (
                                <span key={i}>
                                  "{kw}"
                                  {i < report.keywords.length - 1 ? ", " : ""}
                                </span>
                              ))}
                            </td>
                            <td className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-white">
                              {report.user}
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-400 truncate max-w-[150px]">
                              {report.categories?.join(", ") || "N/A"}
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <button
                                  onClick={() => onViewReport(report)}
                                  className="text-indigo-400 hover:text-indigo-300 p-1"
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
                                  onClick={() =>
                                    handleDownloadReport(
                                      report.report_id || String(report.id)
                                    )
                                  }
                                  className="text-emerald-400 hover:text-emerald-300 p-1"
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
                )}
              </div>
            </div>
          </>
        ) : (
          // Users Tab
          <div className="p-4 sm:p-6 md:p-8 flex-1 overflow-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 md:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-white">
                User Accounts
              </h2>
              <button
                onClick={handleAddUser}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm sm:text-base"
              >
                + Add User
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-[#242850] rounded-xl md:rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead className="bg-[#1a1d3e] border-b border-gray-700/50">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-medium text-gray-400 uppercase">
                        USERNAME
                      </th>
                      <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-medium text-gray-400 uppercase">
                        EMAIL
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-medium text-gray-400 uppercase">
                        ADDED AT
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-medium text-gray-400 uppercase">
                        STATUS
                      </th>
                      <th className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-medium text-gray-400 uppercase">
                        REPORTS
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-medium text-gray-400 uppercase">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-700/20">
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-white font-medium">
                          {user.username}
                        </td>
                        <td className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-400 truncate max-w-[200px]">
                          {user.email}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                          <button
                            onClick={() =>
                              handleToggleUserStatus(user.id, user.status)
                            }
                            className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition ${
                              user.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {user.status}
                          </button>
                        </td>

                        <td className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-white">
                          {user.reportsCount}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                          <div className="flex items-center gap-2 sm:gap-3">
                            {/* Edit Button */}
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-indigo-400 hover:text-indigo-300 p-1.5 hover:bg-indigo-500/10 rounded-lg transition"
                              title="Edit User"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 sm:h-5 sm:w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add/Edit User Modal */}
            {showAddUserForm && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-[#242850] rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
                    {editingUser ? "Edit User" : "Add New User"}
                  </h3>

                  {formError && (
                    <div className="mb-4 p-2 sm:p-3 bg-red-500/20 text-red-400 rounded-lg text-xs sm:text-sm">
                      {formError}
                    </div>
                  )}

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        disabled={!!editingUser}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        placeholder="Enter username"
                        className={`w-full px-3 sm:px-4 py-2 bg-[#1a1d3e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${
                          editingUser ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      />
                      {editingUser && (
                        <p className="text-xs text-gray-500 mt-1">
                          Username cannot be changed
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="Enter email"
                        className="w-full px-3 sm:px-4 py-2 bg-[#1a1d3e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                        {editingUser ? " Password (Enter only if you want to update) " : "Password"}
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder={
                          editingUser
                            ? "Leave blank to keep current password"
                            : "Enter password"
                        }
                        className="w-full px-3 sm:px-4 py-2 bg-[#1a1d3e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                      {editingUser ? (
                        <p className="text-xs text-gray-400 mt-1">
                          Only enter a password if you want to change it
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 mt-1">
                          Must be 8+ characters with letters, numbers, and
                          special characters (@, #, $, etc.)
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                      <button
                        onClick={handleSubmitForm}
                        className="flex-1 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm sm:text-base"
                      >
                        {editingUser ? "Update" : "Create"}
                      </button>
                      <button
                        onClick={() => setShowAddUserForm(false)}
                        className="flex-1 px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-medium text-sm sm:text-base"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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
            {/* Close Button */}
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

            {/* PDF Viewer */}
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
