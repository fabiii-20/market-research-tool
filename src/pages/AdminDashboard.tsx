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
  const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);
  const [viewReport, setViewReport] = useState<Report | null>(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [formError, setFormError] = useState<string>("");
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    const data = await reportAPI.getReports(selectedUser, fromDate, toDate);
    setReports(data.reports);
    setTotalUsers(data.totalUsers);
    setReportsGenerated(data.reportsGenerated);
    
    if (activeTab === "users") {
      const allUsers = authService.getAllUsers();
      setUsers(allUsers);
    }
  };

  const fetchReports = async () => {
    const data = await reportAPI.getReports(selectedUser, fromDate, toDate);
    setReports(data.reports);
  };

  const handleFilter = () => {
    fetchReports();
  };

  const handleUserSelect = (user: string) => {
    setSelectedUser(user);
    setDropdownOpen(false);
    reportAPI.getReports(user, fromDate, toDate).then((data) => {
      setReports(data.reports);
    });
  };

  const handleViewReport = (report: Report) => {
    setViewReport(report);
  };

  const handleDownloadReport = (reportId: number) => {
    reportAPI.downloadReport(reportId);
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
    setFormData({ username: user.username, email: user.email, password: "" });
    setFormError("");
    setEditingUser(user);
    setShowAddUserForm(true);
  };

  const handleSubmitForm = () => {
    setFormError("");

    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      setFormError("All fields are required");
      return;
    }

    if (editingUser) {
      const result = authService.updateUser(editingUser.id, {
        username: formData.username,
        email: formData.email,
        ...(formData.password && { password: formData.password }),
      });

      if (!result.success) {
        setFormError(result.message);
        return;
      }
    } else {
      const result = authService.addUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: "user",
        status: "active",
      });

      if (!result.success) {
        setFormError(result.message);
        return;
      }
    }

    loadData();
    setShowAddUserForm(false);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      authService.deleteUser(id);
      loadData();
    }
  };

  const handleToggleUserStatus = (userId: string, currentStatus: "active" | "inactive") => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    authService.updateUser(userId, { status: newStatus });
    loadData();
  };

  const allUsers = authService.getAllUsers().filter(u => u.role === "user");
  const userNames = ["All Users", ...allUsers.map(u => u.username)];

  return (
    <div className="min-h-screen bg-[#1a1d3e] flex">
      {/* Sidebar */}
      <aside className="w-60 bg-[#1a1d3e] border-r border-gray-700/50 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-600 grid place-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="3" />
              <path d="M3 12h3M18 12h3M12 3v3M12 18v3" strokeWidth="2" stroke="currentColor" fill="none" />
            </svg>
          </div>
          <span className="text-white text-xl font-bold">DataView</span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <button
            onClick={() => setActiveTab("reports")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === "reports" ? "bg-indigo-600 text-white" : "text-gray-400 hover:bg-gray-700/50"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === "users" ? "bg-indigo-600 text-white" : "text-gray-400 hover:bg-gray-700/50"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span>Users</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-700/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700/50 font-medium"
          >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
  <polyline points="16 17 21 12 16 7" />
  <line x1="21" y1="12" x2="9" y2="12" />
</svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-[#1a1d3e] border-b border-gray-700/50 px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {activeTab === "reports" ? "User Reports" : "User Management"}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {activeTab === "reports" ? "Monitor user activity and generate reports." : "Manage user accounts"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            
            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 overflow-hidden hover:opacity-80 transition"
              >
                <img src="https://i.pravatar.cc/150?img=5" alt="User" className="w-full h-full object-cover" />
              </button>
              
              {profileDropdownOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg z-50 min-w-[150px] py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm font-medium"
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
        </header>

        {/* Content */}
        {activeTab === "reports" ? (
          <>
            {/* Stats Cards */}
            <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#242850] rounded-2xl p-6 flex items-center gap-6">
                <div className="h-16 w-16 rounded-xl bg-indigo-600/20 grid place-items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Logged-In Users</p>
                  <p className="text-white text-3xl font-bold">{totalUsers}</p>
                </div>
              </div>

              <div className="bg-[#242850] rounded-2xl p-6 flex items-center gap-6">
                <div className="h-16 w-16 rounded-xl bg-emerald-600/20 grid place-items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Reports Generated</p>
                  <p className="text-white text-3xl font-bold">{reportsGenerated}</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="px-8 py-4 bg-[#242850] mx-8 rounded-2xl flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-400 text-sm">From:</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-[#1a1d3e] text-white px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">To:</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-[#1a1d3e] text-white px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={handleFilter}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Filter
              </button>

              {(fromDate || toDate || selectedUser !== "All Users") && (
                <button
                  onClick={() => {
                    setFromDate("");
                    setToDate("");
                    setSelectedUser("All Users");
                    reportAPI.getReports("All Users").then((data) => {
                      setReports(data.reports);
                    });
                  }}
                  className="text-gray-400 hover:text-white text-sm underline"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Reports Table */}
            <div className="px-8 py-6 flex-1">
              <div className="bg-[#242850] rounded-2xl overflow-hidden">
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-700/50">
                  <h2 className="text-white text-lg font-semibold">
                    Generated Reports {reports.length > 0 && `(${reports.length})`}
                  </h2>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 bg-[#1a1d3e] text-white px-4 py-2 rounded-lg hover:bg-gray-700/50"
                    >
                      <span className="text-sm text-gray-400">Select User:</span>
                      <span>{selectedUser}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
                      </svg>
                    </button>

                    {dropdownOpen && (
                      <div className="absolute top-full mt-2 right-0 w-48 bg-[#1a1d3e] rounded-xl border border-gray-700 shadow-xl z-50 py-1 max-h-64 overflow-y-auto">
                        {userNames.map((user) => (
                          <button
                            key={user}
                            onClick={() => handleUserSelect(user)}
                            className={`w-full text-left px-4 py-2 hover:bg-indigo-600/20 ${selectedUser === user ? "bg-indigo-600/20 text-indigo-400" : "text-gray-300"}`}
                          >
                            {user}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {reports.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    {totalUsers === 0 ? (
                      <div>
                        <p className="text-lg mb-2">No users have logged in yet.</p>
                        <p className="text-sm">User reports will appear here once users log in through the user portal.</p>
                      </div>
                    ) : (
                      <div>
                        <p>No reports found for the selected filters.</p>
                        <p className="text-sm mt-1">Try adjusting the date range or user.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-[#1a1d3e] border-b border-gray-700/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">DATE</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">KEYWORDS</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">USER</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">CATEGORIES</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                      {reports.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-700/20">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{report.date}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {report.keywords.map((kw, i) => (
                              <span key={i}>"{kw}"{i < report.keywords.length - 1 ? ", " : ""}</span>
                            ))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{report.user}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{report.categories?.join(", ") || "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleViewReport(report)}
                                className="text-indigo-400 hover:text-indigo-300"
                                title="View Report"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDownloadReport(report.id)}
                                className="text-emerald-400 hover:text-emerald-300"
                                title="Download Report"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 16l-5-5h3V4h4v7h3l-5 5zM5 20v-2h14v2H5z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        ) : (
          // Users Tab
          <div className="p-8 flex-1 overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-lg font-semibold">User Accounts</h2>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                + Add User
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-[#242850] rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#1a1d3e] border-b border-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">USERNAME</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">EMAIL</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">ADDED AT</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">STATUS</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">REPORTS</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700/20">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">{user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.status)}
                          className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition ${
                            user.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {user.status}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.reportsCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-400 hover:text-red-300 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add/Edit User Modal */}
            {showAddUserForm && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-[#242850] rounded-2xl max-w-md w-full p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    {editingUser ? "Edit User" : "Add New User"}
                  </h3>

                  {formError && (
                    <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">
                      {formError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="Enter username"
                        className="w-full px-4 py-2 bg-[#1a1d3e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email"
                        className="w-full px-4 py-2 bg-[#1a1d3e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Password {editingUser && "(leave blank to keep current)"}
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Enter password (8+ chars, letters, numbers, special chars)"
                        className="w-full px-4 py-2 bg-[#1a1d3e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Must be 8+ characters with letters, numbers, and special characters (@, #, $, etc.)
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSubmitForm}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                      >
                        {editingUser ? "Update" : "Create"}
                      </button>
                      <button
                        onClick={() => setShowAddUserForm(false)}
                        className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-medium"
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
      {viewReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#242850] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700/50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Report Details</h3>
              <button
                onClick={() => setViewReport(null)}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-400">Date</p>
                <p className="text-white font-medium">{viewReport.date}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">User</p>
                <p className="text-white font-medium">{viewReport.user}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Keywords</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {viewReport.keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-full text-sm">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Categories</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {viewReport.categories?.map((cat, i) => (
                    <span key={i} className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-sm">
                      {cat}
                    </span>
                  )) || <p className="text-gray-400 text-sm">N/A</p>}
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-700/50">
                <p className="text-sm text-gray-400 mb-2">Report Content</p>
                <div className="bg-[#1a1d3e] rounded-lg p-4 text-gray-300 text-sm">
                  <p className="mb-2">This is a placeholder for the actual report content.</p>
                  <p>TODO: Fetch full report data from backend API:</p>
                  <code className="block mt-2 text-xs text-indigo-400">
                    GET /api/reports/{viewReport.id}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
