"use client";
import { useEffect, useState } from "react";
import { getUserEmail, getUserPoints } from "@/actions/post";

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const userEmail = await getUserEmail();
      setEmail(userEmail);
      const userPoints = await getUserPoints(userEmail);
      setPoints(userPoints);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white text-lg">Loading profile...</div>
      </div>
    );

  const avatarLetter = email ? email.charAt(0).toUpperCase() : "?";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800 flex flex-col items-center py-16 px-4">
      <div className="bg-white/90 rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center">
        <div className="mb-6">
          <span className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white font-extrabold text-4xl border-4 border-blue-400 shadow-lg">
            {avatarLetter}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{email}</h2>
        <div className="flex flex-col items-center gap-2 w-full mt-4">
          <div className="w-full flex justify-between items-center bg-slate-100 rounded-lg px-4 py-3 mb-2">
            <span className="text-slate-600 font-medium">Points</span>
            <span className="text-blue-700 font-bold text-lg">{points}</span>
          </div>
        </div>
        <button
          className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition"
          onClick={() => (window.location.href = "/home")}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
