"use client";
import React, { useEffect, useState } from "react";
import supabaseAdmin from "@/utils/supabase/supabaseClient";
import { useRouter } from "next/navigation";

async function fetchUsers(timeRange: "week" | "all") {
  try {
    const now = new Date();
    let fromDate = null;

    if (timeRange === "week") {
      fromDate = new Date();
      const dayOfWeek = fromDate.getDay(); // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
      const daysSinceMonday = (dayOfWeek + 6) % 7; // Calculate days since the last Monday
      fromDate.setDate(fromDate.getDate() - daysSinceMonday); // Set the date to the most recent Monday
      fromDate.setHours(0, 0, 0, 0); // Reset time to the start of the day
    }

    const { data, error } = await supabaseAdmin.from("profile").select(`
        email,
        jobs (
          id,
          created_at
        )
      `);

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    // Filter jobs based on the time range
    const usersWithJobCount = data.map((user) => {
      const filteredJobs = fromDate
        ? user.jobs.filter((job) => new Date(job.created_at) >= fromDate)
        : user.jobs;

      return {
        email: user.email,
        jobCount: filteredJobs ? filteredJobs.length : 0, // Count the number of jobs
      };
    });

    // Sort users by job count in descending order
    return usersWithJobCount.sort((a, b) => b.jobCount - a.jobCount);
  } catch (err) {
    console.error("Unexpected error:", err);
    return [];
  }
}

const Leaderboard = () => {
  const [users, setUsers] = useState<{ email: string; jobCount: number }[]>([]);
  const [timeRange, setTimeRange] = useState<"week" | "all">("week"); // Default to "week"
  const router = useRouter();

  useEffect(() => {
    const getUsers = async () => {
      const fetchedUsers = await fetchUsers(timeRange);
      setUsers(fetchedUsers);
    };
    getUsers();
  }, [timeRange]);

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#4CAF50",
          marginBottom: "20px",
          fontSize: "36px",
          fontWeight: "bold",
        }}
      >
        Leaderboard
      </h1>
      <button
        onClick={() => router.push("/")}
        style={{
          display: "block",
          margin: "0 auto 20px auto",
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#4CAF50",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Home
      </button>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={() => setTimeRange("week")}
          style={{
            marginRight: "10px",
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: timeRange === "week" ? "#4CAF50" : "#f0f0f0",
            color: timeRange === "week" ? "#fff" : "#333",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Past Week
        </button>
        <button
          onClick={() => setTimeRange("all")}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: timeRange === "all" ? "#4CAF50" : "#f0f0f0",
            color: timeRange === "all" ? "#fff" : "#333",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          All Time
        </button>
      </div>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {users.map((user, index) => (
          <li
            key={user.email}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 15px",
              margin: "10px 0",
              borderRadius: "8px",
              backgroundColor:
                index === 0
                  ? "#FFD700" // Gold for 1st place
                  : index === 1
                  ? "#C0C0C0" // Silver for 2nd place
                  : index === 2
                  ? "#CD7F32" // Bronze for 3rd place
                  : "#f9f9f9", // Default background for others
              color: index < 3 ? "#000" : "#333",
              fontWeight: index < 3 ? "bold" : "normal",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <span>
              {index + 1}. {user.email}
            </span>
            <span>{user.jobCount} jobs</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
