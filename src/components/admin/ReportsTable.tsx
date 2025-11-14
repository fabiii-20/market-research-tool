import React from "react";
import type { Report } from "../../types";

interface ReportsTableProps {
  reports: Report[];
  loading: boolean;
  reportsPage: number;
  reportsTotalPages: number;
  reportsTotal: number;
  onPageChange: (page: number) => void;
  onViewReport: (report: Report) => void;
  onDownloadReport: (searchId: string) => void;
}

export default function ReportsTable({
  reports,
  loading,
  reportsPage,
  reportsTotalPages,
  reportsTotal,
  onPageChange,
  onViewReport,
  onDownloadReport,
}: ReportsTableProps) {
  return (
    <div>
      <h2 className="text-white mb-2 font-semibold text-lg">
        Total Searches {reportsTotal > 0 && `(${reportsTotal})`}
      </h2>
      {loading ? (
        <div className="p-6 text-center text-gray-400">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="p-6 text-center text-gray-400">
          <p>No reports found</p>
          <p>Try adjusting the filters</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-[#1a1d3e] border-b border-gray-700/50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                    DATE
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                    KEYWORDS
                  </th>
                  <th className="hidden sm:table-cell px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                    USER
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                    CATEGORIES
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-700/20">
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-white">
                      {report.date}
                    </td>
                    <td className="px-3 py-2 text-xs">
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
                    <td className="hidden sm:table-cell px-3 py-2 whitespace-nowrap text-xs text-white">
                      {report.user}
                    </td>
                    <td className="px-3 py-2 text-xs">
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
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
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
                          onClick={() => onDownloadReport(report.reportId || "")}
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
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
}

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
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
}
