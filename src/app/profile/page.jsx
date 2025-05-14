"use client";
import { useEffect, useState } from "react";
import {
  getUserEmail,
  getUserPoints,
  getUserMissions,
  getUserDiamonds,
} from "@/actions/post";

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [points, setPoints] = useState(0);
  const [diamonds, setDiamonds] = useState(0); // <-- add diamonds state
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const userEmail = await getUserEmail();
      setEmail(userEmail);
      const userPoints = await getUserPoints(userEmail);
      setPoints(userPoints);

      // Fetch diamonds from profile table
      const diamond = await getUserDiamonds(userEmail);
      setDiamonds(diamond || 0);

      const userMissions = await getUserMissions(userEmail);
      setMissions(userMissions);
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
    <div className="min-h-screen max-h-screen overflow-hidden bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800 flex flex-col items-center py-16 px-4">
      <div className="bg-white/90 rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center">
        {/* Avatar and Email in one line */}
        <div className="flex items-center mb-6 gap-3">
          <span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-extrabold text-base border-2 border-blue-400 shadow-lg">
            {avatarLetter}
          </span>
          <h2 className="text-xl font-bold text-slate-800">{email}</h2>
        </div>
        <div className="flex flex-col items-center gap-2 w-full mt-4">
          <div className="w-full flex justify-between items-center bg-slate-100 rounded-lg px-4 py-3 mb-2">
            <span className="text-slate-600 font-medium">Points</span>
            <span className="text-blue-700 font-bold text-lg">{points}</span>
          </div>
          <div className="w-full flex justify-between items-center bg-yellow-100 rounded-lg px-4 py-3 mb-2">
            <span className="text-yellow-700 font-medium flex items-center">
              <svg
                className="w-5 h-5 mr-1 inline"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.77l-4.77 2.51.91-5.32-3.87-3.77 5.34-.78z" />
              </svg>
              Diamonds
            </span>
            <span className="text-yellow-700 font-bold text-lg">
              {diamonds}
            </span>
          </div>
        </div>
        {/* Missions Section */}
        <div className="w-full mt-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Your Missions
          </h3>
          {missions.length === 0 ? (
            <div className="text-slate-500 text-sm">No missions assigned.</div>
          ) : (
            missions.map((m) => (
              <div
                key={m.id}
                className={`mb-3 p-4 rounded-lg shadow ${
                  m.completed ? "bg-green-100" : "bg-slate-100"
                }`}
              >
                <div className="font-bold text-slate-800">{m.description}</div>
                <div className="text-slate-600 text-sm mb-1">
                  Progress: {m.progress} / {m.target}
                </div>
                {m.completed && (
                  <span className="text-green-700 font-semibold">
                    Completed!
                  </span>
                )}
                {m.reward_item && (
                  <div className="text-blue-700 text-xs mt-1">
                    Reward: {m.reward_item}
                  </div>
                )}
                {m.reward_points > 0 && (
                  <div className="text-blue-700 text-xs mt-1">
                    Reward: {m.reward_points} points
                  </div>
                )}
              </div>
            ))
          )}
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
