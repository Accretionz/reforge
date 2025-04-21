"use client";
import React, { useEffect, useState } from "react";
import supabaseAdmin from "@/utils/supabase/supabaseClient";
import { useRouter } from "next/navigation";

async function fetchUsers() {
  try {
    const { data, error } = await supabaseAdmin.from("profile").select(`
        email,
        jobs:jobs(count) // Fetch the count of jobs submitted by each user
      `);

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    // Map the data to include the job count
    const usersWithJobCount = data.map((user) => ({
      email: user.email,
      jobCount: user.jobs[0]?.count || 0,
    }));

    // Sort users by job count in descending order
    return usersWithJobCount.sort((a, b) => b.jobCount - a.jobCount);
  } catch (err) {
    console.error("Unexpected error:", err);
    return [];
  }
}

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const getUsers = async () => {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    };
    getUsers();
  }, []);

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
