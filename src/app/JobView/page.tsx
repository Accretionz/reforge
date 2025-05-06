"use client";
import React, { useEffect, useState } from "react";
import supabase from "@/utils/supabase/supabaseClient";
import { useRouter } from "next/navigation";
import JobModal from "./JobModal";
import JobTable from "./JobTable";

interface Job {
  id: string;
  job_title: string;
  company_name: string;
  location: string;
  applied_date: string;
  application_url: string;
  salary: string;
  status: string;
}

export default function JobView() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
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
  const [modalMounted, setModalMounted] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const router = useRouter();

  useEffect(() => {
    setModalMounted(true);
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("You must be logged in to view your job applications.");
        router.push("/Login");
        return;
      }

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

    fetchJobs();
  }, [router]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching jobs:", error.message);
      alert("Failed to fetch updated jobs.");
      return;
    }

    setJobs(data || []);
    setFilteredJobs(data || []);
    closeModal();

    alert("Job submitted successfully! You earned 100 points.");
  };

  const handleDelete = async (jobId: string) => {
    const { error } = await supabase.from("jobs").delete().eq("id", jobId);

    if (error) {
      console.error("Error deleting job:", error.message);
      alert("Failed to delete job. Please check the console for more details.");
    } else {
      alert("Job deleted successfully!");
      const updatedJobs = jobs.filter((job) => job.id !== jobId);
      setJobs(updatedJobs);
      setFilteredJobs(updatedJobs);
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

  const toggleJobDetails = (jobId: string) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  const confirmDelete = async (jobId: string) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      await handleDelete(jobId);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
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
    const filtered = jobs.filter((job) => {
      const matchesSearchQuery = job.company_name
        .toLowerCase()
        .includes(searchQuery);
      const matchesStatus =
        statusFilter === "all" || job.status === statusFilter;

      return matchesSearchQuery && matchesStatus;
    });

    setFilteredJobs(filtered);
  }, [jobs, searchQuery, statusFilter]);

  return (
    <div className="px-4 max-w-7xl mx-auto relative">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Filter Jobs"
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-3 pr-10 py-2 border border-gray-300 rounded focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2  text-white focus:outline-none h-10.5"
          >
            <option value="all" className="text-black">
              All
            </option>
            <option value="applied" className="text-black">
              Applied
            </option>
            <option value="accepted" className="text-black">
              Accepted
            </option>
            <option value="rejected" className="text-black">
              Rejected
            </option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push("/")}
            className="bg-gray-500 text-white px-4 py-2 rounded flex items-center hover:bg-gray-600 transition duration-200"
          >
            Home Page
          </button>
          <button
            onClick={openModal}
            className="bg-teal-700 text-white px-4 py-2 rounded flex items-center hover:bg-teal-800 transition duration-200"
          >
            Add a New Job
          </button>
        </div>
      </div>

      <JobTable
        jobs={filteredJobs}
        expandedJobId={expandedJobId}
        toggleJobDetails={toggleJobDetails}
        handleStatusChange={handleStatusChange}
        confirmDelete={confirmDelete}
      />

      {modalMounted && (
        <JobModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          formData={formData}
          onChange={handleChange}
        />
      )}
    </div>
  );
}
