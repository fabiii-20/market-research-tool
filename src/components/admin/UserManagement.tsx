import React, { useState, useEffect } from "react";
import type { UserAccount } from "../../types";
import { authService } from "../../services/authService";

export default function UserManagement() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState<string>("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await authService.getAllUsers();
      setUsers(data.users);
    } catch (error) {
      console.error("❌ Error loading users:", error);
    } finally {
      setLoading(false);
    }
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
        const updateData: {
          email?: string;
          password?: string;
          role?: "user" | "admin";
        } = {
          email: formData.email,
        };
        
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
        if (!formData.password.trim()) {
          setFormError("Password is required for new users");
          return;
        }
        
        if (formData.password.length < 8) {
          setFormError("Password must be at least 8 characters");
          return;
        }
        
        // ✅ Always create users with "user" role
        const result = await authService.addUser(
          formData.username,
          formData.email,
          formData.password,
        );
        
        if (!result.success) {
          setFormError(result.message || "Failed to add user");
          return;
        }
        
        alert("User added successfully!");
      }

      await loadUsers();
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
      await loadUsers();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 flex-1 overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 md:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-white">
          User Accounts {users.length > 0 && `(${users.length})`}
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
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No users found</div>
        ) : (
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
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                  {editingUser ? "Password (enter only if you want to change)" : "Password"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={
                    editingUser
                      ? "Leave blank to keep current"
                      : "Enter password"
                  }
                  className="w-full px-3 sm:px-4 py-2 bg-[#1a1d3e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {editingUser ? "Only enter to change password" : "Must be 8+ characters"}
                </p>
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
  );
}
