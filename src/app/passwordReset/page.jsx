"use client";
import { useEffect, useState } from "react";
import supabase from "@/utils/supabase/supabaseClient";

export default function PasswordResetPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    // Wait for Supabase to pick up the session from the URL
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setStatus({
          type: "error",
          message:
            "No valid password reset session found. Please use the link from your email.",
        });
      }
      setSessionChecked(true);
    };
    checkSession();
  }, []);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus({ type: "error", message: error.message });
    } else {
      setStatus({
        type: "success",
        message: "Password updated! You can now log in with your new password.",
      });
    }
    setLoading(false);
  };

  if (!sessionChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white text-lg">Checking reset session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800 px-4">
      <form
        onSubmit={handlePasswordReset}
        className="bg-white/90 rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center"
      >
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          Set New Password
        </h2>
        <input
          type="password"
          required
          minLength={6}
          placeholder="Enter your new password"
          className="mb-4 px-4 py-2 rounded-lg border border-slate-300 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition w-full"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
        {status && (
          <div
            className={`mt-4 text-center ${
              status.type === "error" ? "text-red-600" : "text-green-600"
            }`}
          >
            {status.message}
          </div>
        )}
      </form>
    </div>
  );
}
