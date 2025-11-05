import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthMode } from "../types";
import { userService } from "../services/userService";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("user");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // TODO: Replace with real API authentication
    // const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password, role: mode })
    // });
    // const data = await response.json();
    // if (data.success) { ... }
    
    console.log(`${mode} login attempt:`, { email, password });

    await new Promise((r) => setTimeout(r, 500));
    
    if (mode === "admin") {
      navigate("/admin");
    } else {
      // Save user login to localStorage
      userService.addUserLogin(email);
      navigate("/search");
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-200 via-gray-300 to-indigo-200 flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-5xl">
        <div className="relative bg-white rounded-3xl shadow-2xl w-full">
          <div
            className={`pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-br from-[#2a3a9e] to-indigo-500/80 opacity-10 transition-transform duration-700 ease-out hidden md:block ${
              mode === "user" ? "translate-x-full" : "translate-x-0"
            }`}
          />
          <div className="flex flex-col md:flex-row md:min-h-[520px]">
            <div className="relative w-full md:w-1/2 bg-[#2a3a9e] text-white p-8 md:p-12 flex flex-col justify-center items-center overflow-hidden">
              <div
                className={`pointer-events-none absolute -top-24 right-6 md:-top-20 md:-right-20 w-48 h-48 md:w-64 md:h-64 bg-[#BEC8FF] rounded-full opacity-50 transition-transform duration-700 ease-out ${
                  mode === "user" ? "translate-x-4 -translate-y-2" : ""
                }`}
              />
              <div className="relative z-10 text-center max-w-md">
                <h2 className="text-3xl font-bold mb-4">
                  {mode === "admin" ? "Admin Portal" : "Welcome Back!"}
                </h2>
                <p className="text-indigo-100 mb-8">
                  {mode === "admin"
                    ? "Access administrative features and manage reports"
                    : "Enter your credentials to access the keyword search tool"}
                </p>
                <button
                  onClick={() => setMode(mode === "admin" ? "user" : "admin")}
                  className="border-2 border-white text-white px-8 py-2 rounded-full hover:bg-white hover:text-[#2a3a9e] transition-all duration-300 font-semibold"
                >
                  {mode === "admin" ? "USER LOGIN" : "ADMIN LOGIN"}
                </button>
              </div>
            </div>

            <div className="relative w-full md:w-1/2 p-8 md:p-12 min-h-[420px] md:min-h-[460px] flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {mode === "admin" ? "Admin Login" : "User Login"}
                </h2>
                <p className="text-gray-500 text-sm mb-8">
                  Enter your credentials to continue
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex items-center justify-between pt-2">
                    <a href="#" className="text-sm text-indigo-600 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-300 mt-6"
                  >
                    {mode === "admin" ? "ADMIN LOGIN" : "USER LOGIN"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
