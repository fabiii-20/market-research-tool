import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { Report } from "../types";
import { reportAPI } from "../services/reportApi";
import { userService } from "../services/userService";

export default function AdminHome() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [reportsGenerated, setReportsGenerated] = useState<number>(0);
  const [selectedUser, setSelectedUser] = useState<string>("All Users");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [viewReport, setViewReport] = useState<Report | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchReports = async () => {
    const data = await reportAPI.getReports(selectedUser, fromDate, toDate);
    setReports(data.reports);
    setTotalUsers(data.totalUsers);
    setReportsGenerated(data.reportsGenerated);
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

  const loggedUsers = userService.getLoggedUsers();
  const userNames = ["All Users", ...loggedUsers.map((u) => u.name || u.email)];

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
            onClick={() => navigate("/admin")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
            <span>Dashboard</span>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-600 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
            </svg>
            <span>User Reports</span>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span>Users</span>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm2 4v-2H3a2 2 0 002 2zM3 9h2V7H3v2zm12 12h2v-2h-2v2zm4-18H9a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2z" />
            </svg>
            <span>Analytics</span>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
            <span>Settings</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-[#1a1d3e] border-b border-gray-700/50 px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">User Reports</h1>
            <p className="text-gray-400 text-sm mt-1">Monitor user activity and generate reports.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 overflow-hidden">
              <img src="https://i.pravatar.cc/150?img=5" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

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
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">PARAMETERS</th>
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
                      <td className="px-6 py-4 text-sm text-gray-400">{report.parameters}</td>
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
                <p className="text-sm text-gray-400">Parameters</p>
                <p className="text-white">{viewReport.parameters}</p>
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
