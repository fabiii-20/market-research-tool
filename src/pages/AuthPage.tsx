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
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-200 via-gray-300 to-indigo-200 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
      <div className="relative w-full max-w-5xl">
        <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full">
          {/* Gradient background - hidden on mobile */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-br from-[#2a3a9e] to-indigo-500/80 opacity-10 transition-transform duration-700 ease-out hidden md:block" />
          
          <div className="flex flex-col md:flex-row md:min-h-[520px]">
            
            {/* LEFT PANEL - Hidden on mobile, visible on MD+ */}
            <div className="hidden md:flex relative w-full md:w-1/2 bg-[#2a3a9e] text-white p-12 flex-col justify-center items-center overflow-hidden rounded-l-3xl">
              {/* Decorative circle - adjusted for mobile */}
              <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 bg-[#BEC8FF] rounded-full opacity-50" />
              
              <div className="relative z-10 text-center max-w-md">
                <h2 className="text-4xl font-bold mb-4">Welcome!</h2>
                <p className="text-indigo-100 text-lg leading-relaxed">
                  Enter your credentials to access the keyword search tool
                </p>
                
                {/* Features list - hidden on mobile */}
                <div className="mt-8 space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</div>
                    <span>Advanced search capabilities</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</div>
                    <span>Real-time analytics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</div>
                    <span>Secure data management</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL - Full width on mobile, half on MD+ */}
            <div className="relative w-full md:w-1/2 p-6 sm:p-8 md:p-12 min-h-[500px] sm:min-h-[420px] md:min-h-[460px] flex flex-col justify-center rounded-2xl md:rounded-r-3xl">
              <div className="max-w-sm mx-auto w-full">
                
                {/* Title - responsive font sizes */}
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                  Login
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm mb-6 sm:mb-8">
                  Enter your credentials to continue
                </p>

                {/* Error message - responsive padding */}
                {error && (
                  <div className="mb-4 sm:mb-6 p-2 sm:p-3 bg-red-100 text-red-700 rounded-lg text-xs sm:text-sm">
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                  
                  {/* Username field */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  {/* Password field */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  {/* Login button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 mt-4 sm:mt-6 text-sm sm:text-base"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>

                {/* Demo credentials - responsive */}
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg text-xs sm:text-sm text-gray-600">
                  <p className="font-semibold mb-2">Demo Credentials:</p>
                  <div className="space-y-1">
                    <p>
                      <span className="text-gray-700">Admin:</span>{" "}
                      <code className="bg-white px-2 py-1 rounded text-xs">admin</code> /{" "}
                      <code className="bg-white px-2 py-1 rounded text-xs">Admin@123</code>
                    </p>
                    <p>
                      <span className="text-gray-700">User:</span>{" "}
                      <code className="bg-white px-2 py-1 rounded text-xs">user</code> /{" "}
                      <code className="bg-white px-2 py-1 rounded text-xs">User@123</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
