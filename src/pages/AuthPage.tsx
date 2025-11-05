import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export default function AuthPage() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    authService.initializeUsers();
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await authService.login(username, password);

    if (result.success && result.user) {
      if (result.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/search");
      }
    } else {
      setError(result.message || "Login failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-200 via-gray-300 to-indigo-200 flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-5xl">
        <div className="relative bg-white rounded-3xl shadow-2xl w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-br from-[#2a3a9e] to-indigo-500/80 opacity-10 transition-transform duration-700 ease-out hidden md:block" />
          
          <div className="flex flex-col md:flex-row md:min-h-[520px]">
            {/* Left Panel */}
            <div className="relative w-full md:w-1/2 bg-[#2a3a9e] text-white p-8 md:p-12 flex flex-col justify-center items-center overflow-hidden">
              <div className="pointer-events-none absolute -top-24 right-6 md:-top-20 md:-right-20 w-48 h-48 md:w-64 md:h-64 bg-[#BEC8FF] rounded-full opacity-50" />
              
              <div className="relative z-10 text-center max-w-md">
                <h2 className="text-3xl font-bold mb-4">Welcome!</h2>
                <p className="text-indigo-100 mb-8">
                  Enter your credentials to access the keyword search tool
                </p>
              </div>
            </div>

            {/* Right Panel */}
            <div className="relative w-full md:w-1/2 p-8 md:p-12 min-h-[420px] md:min-h-[460px] flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Login</h2>
                <p className="text-gray-500 text-sm mb-8">Enter your credentials to continue</p>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 mt-6"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg text-xs text-gray-600">
                  <p className="font-semibold mb-2">Demo Credentials:</p>
                  <p>Admin: <code className="bg-white px-1">admin</code> / <code className="bg-white px-1">Admin@123</code></p>
                  <p>User: <code className="bg-white px-1">user</code> / <code className="bg-white px-1">User@123</code></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
