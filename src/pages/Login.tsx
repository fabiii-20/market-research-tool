import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { UserRole } from "../types";

export default function Login() {
  const [role, setRole] = useState<UserRole>("user");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: replace with real API call
    await new Promise((r) => setTimeout(r, 600));

    if (role === "user") navigate("/search");
    else navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 via-gray-300 to-indigo-200 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Login</h1>

        <div className="mb-4 flex gap-3">
          <button
            onClick={() => setRole("user")}
            className={`px-4 py-2 rounded-xl ring-1 font-medium ${
              role === "user"
                ? "bg-indigo-600 text-white ring-indigo-600"
                : "ring-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            User
          </button>
          <button
            onClick={() => setRole("admin")}
            className={`px-4 py-2 rounded-xl ring-1 font-medium ${
              role === "admin"
                ? "bg-indigo-600 text-white ring-indigo-600"
                : "ring-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder={`${role === "admin" ? "Admin" : "User"} email`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Continue
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500">
          Placeholder login — backend will replace with real API.
        </p>
      </div>
    </div>
  );
}
