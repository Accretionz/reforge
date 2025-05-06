"use client";
import { useEffect, useState } from "react";
import { getUserEmail, getUserPoints } from "@/actions/post";
import { useRouter } from "next/navigation";
import supabase from "@/utils/supabase/supabaseClient";

type Job = {
  id: string;
  created_at: string;
  job_title: string;
  company_name: string;
  location: string;
  applied_date: string;
  application_url: string;
  salary: number;
  user_id: string;
  status: string;
};

type LeaderboardUser = {
  email: string;
  jobCount: number;
};

export default function HomeDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [points, setPoints] = useState<number | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) router.push("/Login");
    };

    const fetchJobs = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("user_id", user?.id);
      setJobs((data as Job[]) || []);
    };

    const fetchUserPoints = async () => {
      const email = await getUserEmail();
      if (email) {
        const userPoints = await getUserPoints(email);
        setPoints(userPoints);
      }
    };

    const fetchLeaderboardPosition = async () => {
      const email = await getUserEmail();
      if (!email) return;

      const now = new Date();
      const dayOfWeek = now.getDay(); // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
      const daysSinceMonday = (dayOfWeek + 6) % 7; // Calculate days since the last Monday
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - daysSinceMonday); // Set the date to the most recent Monday
      fromDate.setHours(0, 0, 0, 0); // Reset time to the start of the day

      const { data, error } = await supabase.from("profile").select(`
          email,
          jobs (
            id,
            created_at
          )
        `);

      if (error) {
        console.error("Error fetching leaderboard data:", error);
        return;
      }

      // Calculate job counts for each user for the current week
      const leaderboard: LeaderboardUser[] = data.map((user) => {
        const weeklyJobs = user.jobs.filter(
          (job) => new Date(job.created_at) >= fromDate
        );

        return {
          email: user.email,
          jobCount: weeklyJobs.length,
        };
      });

      // Sort leaderboard by job count in descending order
      leaderboard.sort((a, b) => b.jobCount - a.jobCount);

      // Find the user's position
      const userPosition = leaderboard.findIndex(
        (user) => user.email === email
      );

      setPosition(userPosition !== -1 ? userPosition + 1 : null); // Convert to 1-based index
    };

    checkSession();
    fetchJobs();
    fetchUserPoints();
    fetchLeaderboardPosition();
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto w-full p-8 text-white">
      <>
        <div className="w-11/12 mx-auto bg-[#181818] rounded-3xl p-10 text-center mb-[25px]">
          <h1 className="text-6xl font-bold text-white mt-5 mb-5 w-3/4 mx-auto flex items-center justify-center">
            Reforge
          </h1>
          <p className="text-xl text-white mb-7 w-3/4 mx-auto">
            It only takes one yes. So keep going until you get it.
          </p>
          <button
            className="bg-white text-black font-medium mb-5 py-2 px-6 rounded-full inline-flex items-center transition-transform transform hover:bg-gray-200 cursor-pointer"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/Login");
            }}
          >
            Sign Out
          </button>
        </div>

        <div className="w-11/12 mx-auto grid grid-cols-1 md:grid-cols-2 gap-[25px] mb-[25px]">
          <div className="bg-[#181818] bg-opacity-90 rounded-3xl p-8">
            <h2 className="text-white text-xl font-medium mb-2">
              Job Applications
            </h2>
            <p className="text-5xl font-bold text-white mb-1">{jobs.length}</p>
            <p className="text-gray-400 mb-6">Sent</p>
            <button
              className="border-2 border-white text-white font-medium py-2 px-6 rounded-full inline-flex items-center cursor-pointer"
              onClick={() => router.push("/JobView")}
            >
              View Job Applications
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>

          <div className="bg-[#181818] bg-opacity-90 rounded-3xl p-8">
            <h2 className="text-white text-xl font-medium mb-2">Gems</h2>
            <p className="text-5xl font-bold text-white mb-1">
              {points !== null ? points : "Loading..."}{" "}
            </p>
            <p className="text-gray-400 mb-6">Total</p>
            <button
              className="border-2 border-white text-white font-medium py-2 px-6 rounded-full inline-flex items-center cursor-pointer"
              onClick={() => router.push("/Shop")}
            >
              Access the Shop
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom row stats */}
        <div className="w-11/12 mx-auto grid grid-cols-1 md:grid-cols-2 gap-[25px]">
          {/* Total Tasks */}
          <div className="bg-[#181818] bg-opacity-90 rounded-3xl p-8">
            <h2 className="text-white text-xl font-medium mb-2">Leaderboard</h2>
            <p className="text-5xl font-bold text-white mb-1">
              {position !== null ? `#${position}` : "Loading..."}
            </p>
            <p className="text-gray-400 mb-6">Position</p>
            <button
              className="border-2 border-white text-white font-medium py-2 px-6 rounded-full inline-flex items-center cursor-pointer"
              onClick={() => router.push("/Leaderboard")}
            >
              View Leaderboard
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>

          <div className="bg-[#181818] bg-opacity-90 rounded-3xl p-8">
            <h2 className="text-white text-xl font-medium mb-2">Chests</h2>
            <p className="text-5xl font-bold text-white mb-1">0</p>
            <p className="text-gray-400 mb-6">Opened</p>
            <button className="border-2 border-white text-white font-medium py-2 px-6 rounded-full inline-flex items-center cursor-pointer">
              Open Chests
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        </div>
      </>
    </div>
  );
}
