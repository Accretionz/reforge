"use client";
import React, { useEffect, useState } from "react";
import supabase from "@/utils/supabase/supabaseClient";
import { useRouter } from "next/navigation";
import JobModal from "./JobModal";
import JobTable from "./JobTable";
import JobStatusChart from "./JobStatusChart";
import LeaderboardWidget from "./LeaderboardWidget";
import { useRef } from "react";

export default function JobView() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    job_title: "",
    company_name: "",
    location: "",
    applied_date: "",
    application_url: "",
    salary: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState([]);
  const [overallLeaderboard, setOverallLeaderboard] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef();
  const [sortOrder, setSortOrder] = useState("recent");

  const router = useRouter();

  const avatarLetter =
    currentUserEmail && typeof currentUserEmail === "string"
      ? currentUserEmail.charAt(0).toUpperCase()
      : "?";

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    }
    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Fetch jobs from database
  const fetchJobs = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in to view your job applications.");
      router.push("/login");
      return;
    }

    setCurrentUserEmail(user.email);

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching jobs:", error.message);
      return;
    }

    setJobs(data || []);
    setFilteredJobs(data || []);
  };

  // Fetch leaderboard data
  const fetchLeaderboardData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Calculate start of the week (Monday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const daysSinceMonday = (dayOfWeek + 6) % 7;
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - daysSinceMonday);
      fromDate.setHours(0, 0, 0, 0);

      // Fetch all users and their jobs
      const { data, error } = await supabase.from("profile").select(`
        id,
        email,
        sapphire,
        last_sapphire_award,
        jobs (
          id,
          created_at
        )
      `);

      if (error) {
        console.error("Error fetching leaderboard data:", error.message);
        return;
      }

      // Process weekly leaderboard
      const weekly = data.map((profile) => {
        const weeklyJobs = profile.jobs.filter(
          (job) => new Date(job.created_at) >= fromDate
        );

        return {
          id: profile.id,
          email: profile.email,
          jobCount: weeklyJobs.length,
          sapphire: profile.sapphire || 0,
          last_sapphire_award: profile.last_sapphire_award,
        };
      });

      // Process overall leaderboard
      const overall = data.map((profile) => {
        return {
          email: profile.email,
          jobCount: profile.jobs.length,
        };
      });

      // Sort by job count in descending order
      weekly.sort((a, b) => b.jobCount - a.jobCount);
      overall.sort((a, b) => b.jobCount - a.jobCount);

      setWeeklyLeaderboard(weekly);
      setOverallLeaderboard(overall);

      // Only run on Monday
      if (now.getDay() === 1 && weekly.length > 0) {
        const topUser = weekly[0];
        // Only award if not already awarded this week
        const thisMonday = new Date(fromDate); // already set to this week's Monday
        const lastAward = topUser.last_sapphire_award
          ? new Date(topUser.last_sapphire_award)
          : null;
        if (!lastAward || lastAward < thisMonday) {
          // Award sapphire
          await supabase
            .from("profile")
            .update({
              sapphire: (topUser.sapphire || 0) + 1,
              last_sapphire_award: thisMonday.toISOString(),
            })
            .eq("id", topUser.id);
        }
      }
    } catch (err) {
      console.error("Error in fetchLeaderboardData:", err);
    }
  };

  const updateMissionsAfterJobSubmit = async (userId) => {
    // Get all active user_missions for this user
    const { data: userMissions, error: missionsError } = await supabase
      .from("user_missions")
      .select(
        `
    id,
    progress,
    completed,
    missions (
      type,
      target,
      reward_points,
      reward_item
    )
  `
      )
      .eq("user_id", userId)
      .eq("completed", false);

    if (missionsError) {
      console.error("Error fetching user missions:", missionsError.message);
      return;
    }

    for (const um of userMissions) {
      const newProgress = (um.progress || 0) + 1;
      const isCompleted = newProgress >= (um.missions?.target || 1);

      // Update mission progress and completion
      const { error: updateError } = await supabase
        .from("user_missions")
        .update({
          progress: newProgress,
          completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq("id", um.id);

      if (updateError) {
        console.error("Error updating mission progress:", updateError.message);
        continue;
      }

      // If just completed, award reward points
      if (isCompleted && um.missions?.reward_points > 0) {
        // Fetch current points
        const { data: userData, error: fetchError } = await supabase
          .from("profile")
          .select("points")
          .eq("id", userId)
          .single();

        if (!fetchError) {
          const newPoints =
            (userData?.points || 0) + (um.missions.reward_points || 0);
          await supabase
            .from("profile")
            .update({ points: newPoints })
            .eq("id", userId);
        }
      }

      // If weekly mission is completed and reward_item is 'diamond', increment diamond count
      if (
        isCompleted &&
        um.missions?.type === "weekly" &&
        um.missions?.reward_item === "diamond"
      ) {
        // Fetch current diamond count
        const { data: userData, error: diamondError } = await supabase
          .from("profile")
          .select("diamond")
          .eq("id", userId)
          .single();

        if (!diamondError) {
          const newDiamonds = (userData?.diamond || 0) + 1;
          await supabase
            .from("profile")
            .update({ diamond: newDiamonds })
            .eq("id", userId);
        }
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchJobs();
      await fetchLeaderboardData();
    };

    loadData();
  }, [router]);

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    const {
      job_title,
      company_name,
      location,
      applied_date,
      application_url,
      salary,
    } = formData;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in to submit a job application.");
      return;
    }

    const { error: jobError } = await supabase.from("jobs").insert({
      job_title,
      company_name,
      location,
      applied_date,
      application_url: application_url || null,
      salary: salary ? Number(salary) : null,
      user_id: user.id,
    });

    if (jobError) {
      console.error("Error saving job:", jobError.message);
      alert("Failed to save job.");
      return;
    }

    const { data: userData, error: fetchError } = await supabase
      .from("profile")
      .select("points")
      .eq("id", user.id)
      .single();

    if (fetchError) {
      console.error("Error fetching user points:", fetchError.message);
      alert("Failed to fetch user points.");
      return;
    }

    const newPoints = (userData?.points || 0) + 100;

    const { error: pointsError } = await supabase
      .from("profile")
      .update({ points: newPoints })
      .eq("id", user.id);

    if (pointsError) {
      console.error("Error updating points:", pointsError.message);
      alert("Failed to update points.");
      return;
    }

    await updateMissionsAfterJobSubmit(user.id);

    // Refresh data after submission
    fetchJobs();
    fetchLeaderboardData();
    closeModal();

    alert("Job submitted successfully! You earned 100 points.");
  };

  const handleDelete = async (jobId) => {
    const { error } = await supabase.from("jobs").delete().eq("id", jobId);

    if (error) {
      console.error("Error deleting job:", error.message);
      alert("Failed to delete job. Please check the console for more details.");
    } else {
      alert("Job deleted successfully!");
      const updatedJobs = jobs.filter((job) => job.id !== jobId);
      setJobs(updatedJobs);
      setFilteredJobs(updatedJobs);
      // Refresh leaderboard data after deletion
      fetchLeaderboardData();
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      job_title: "",
      company_name: "",
      location: "",
      applied_date: "",
      application_url: "",
      salary: "",
    });
  };

  const toggleJobDetails = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  const confirmDelete = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      await handleDelete(jobId);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", jobId);

    if (error) {
      console.error("Error updating status:", error.message);
      alert("Failed to update status. Please try again.");
    } else {
      const updatedJobs = jobs.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job
      );
      setJobs(updatedJobs);
      setFilteredJobs(updatedJobs);
    }
  };

  useEffect(() => {
    let filtered = jobs.filter((job) => {
      const matchesSearchQuery = job.company_name
        .toLowerCase()
        .includes(searchQuery);
      const matchesStatus =
        statusFilter === "all" || job.status === statusFilter;

      return matchesSearchQuery && matchesStatus;
    });

    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.applied_date);
      const dateB = new Date(b.applied_date);
      if (sortOrder === "recent") {
        return dateB - dateA; // Most recent first
      } else {
        return dateA - dateB; // Oldest first
      }
    });

    setFilteredJobs(filtered);
  }, [jobs, searchQuery, statusFilter, sortOrder]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full bg-slate-800 text-white py-4 shadow mb-5">
        <div className="flex justify-between items-center max-w-8xl mx-auto px-10">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => router.push("/home")}
          >
            <img
              src="/hammer_anvil.svg"
              alt="Anvil Logo"
              className="h-8 w-8 mr-2 filter invert"
            />
            <h1 className="text-xl font-bold px-2">Reforge</h1>
          </div>
          <div className="relative " ref={profileMenuRef}>
            <button
              className="flex items-center focus:outline-none cursor-pointer"
              onClick={() => setShowProfileMenu((v) => !v)}
            >
              <span className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg border-2 border-blue-400">
                {avatarLetter}
              </span>
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg z-50">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-t"
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push("/profile");
                  }}
                >
                  Profile
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-b"
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-8xl mx-auto w-full px-10">
        <div className="grid grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-1">
            {/* Search Container */}
            <div className="bg-gray-100 p-4 rounded shadow  mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search job"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-3 pr-10 py-2 border text-black border-gray-300 rounded focus:outline-none w-full"
                />
                <button
                  onClick={() =>
                    handleSearchChange({ target: { value: searchQuery } })
                  }
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Chart Container - Separate from search */}
            <div className="bg-gray-100 p-4 rounded shadow  mb-4">
              <h3 className="text-gray-700 font-medium mb-3 text-center">
                Job Status Overview
              </h3>
              <JobStatusChart jobs={jobs} />
            </div>

            {/* Leaderboard Widget */}
            <div className="bg-gray-100 p-4 rounded shadow ">
              <LeaderboardWidget
                weeklyLeaderboard={weeklyLeaderboard}
                overallLeaderboard={overallLeaderboard}
                currentUserEmail={currentUserEmail}
              />
            </div>
          </div>

          {/* Main Content */}
          <main className="col-span-3">
            <div className="bg-slate-800 p-4 rounded-lg shadow mb-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                {/* Status Filter */}
                <div className="relative min-w-[150px]">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-transparent border border-gray-300 rounded px-4 py-2 text-white pr-8 w-full focus:outline-none"
                  >
                    <option value="all" className="bg-gray-800 text-white">
                      All
                    </option>
                    <option value="applied" className="bg-gray-800 text-white">
                      Applied
                    </option>
                    <option value="accepted" className="bg-gray-800 text-white">
                      Accepted
                    </option>
                    <option value="rejected" className="bg-gray-800 text-white">
                      Rejected
                    </option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {/* Sort By Dropdown */}
                <div className="relative min-w-[150px]">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="appearance-none bg-transparent border border-gray-300 rounded px-4 py-2 text-white pr-8 w-full focus:outline-none"
                  >
                    <option value="recent" className="bg-gray-800 text-white">
                      Most Recent
                    </option>
                    <option value="oldest" className="bg-gray-800 text-white">
                      Oldest
                    </option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <button
                onClick={openModal}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
              >
                Add Job
              </button>
            </div>

            <div className="bg-transparent rounded">
              <JobTable
                jobs={filteredJobs}
                expandedJobId={expandedJobId}
                toggleJobDetails={toggleJobDetails}
                handleStatusChange={handleStatusChange}
                confirmDelete={confirmDelete}
              />
            </div>
          </main>
        </div>
      </div>

      <JobModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        formData={formData}
        onChange={handleChange}
      />
    </div>
  );
}
