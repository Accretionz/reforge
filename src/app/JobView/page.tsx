"use client";
import React from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getAllPost } from "@/actions/post";
import supabase from "@/utils/supabase/supabaseClient";
import { useRouter } from "next/navigation";

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

    const filtered = jobs.filter((job) =>
      job.company_name.toLowerCase().includes(query)
    );
    setFilteredJobs(filtered);
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

    const { data: profile, error: profileError } = await supabase
      .from("profile")
      .select("points")
      .eq("email", user.email)
      .single();

    if (profileError) {
      console.error("Error fetching user points:", profileError.message);
      alert("Failed to fetch user points.");
      return;
    }

    const currentPoints = profile?.points || 0;
    const updatedPoints = currentPoints + 100;

    const { error: pointsError } = await supabase
      .from("profile")
      .update({ points: updatedPoints })
      .eq("email", user.email);

    if (pointsError) {
      console.error("Error updating points:", pointsError.message);
      alert("Failed to update user points.");
      return;
    }

    const data: Job[] = await getAllPost();
    setJobs(data);
    setFilteredJobs(data);
    closeModal();

    alert("Job submitted successfully! You earned 100 points.");
  };

  const handleDelete = async (jobId: string) => {
    console.log("Deleting job with ID:", jobId);

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
            <button className="absolute right-3 top-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push("/")}
            className="bg-gray-500 text-white px-4 py-2 rounded flex items-center hover:bg-gray-600 transition duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 16 16"
              className="mr-2"
            >
              <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6a.5.5 0 0 0 .708.708L8 1.707l5.646 5.647a.5.5 0 0 0 .708-.708l-6-6z" />
              <path d="M3 8v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V8a.5.5 0 0 0-1 0v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a.5.5 0 0 0-1 0z" />
            </svg>
            Home Page
          </button>
          <button
            onClick={openModal}
            className="bg-teal-700 text-white px-4 py-2 rounded flex items-center hover:bg-teal-800 transition duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 16 16"
              className="mr-2"
            >
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
            </svg>
            Add a New Job
          </button>
        </div>
      </div>

      {/* Job Listings Table */}
      <div className="overflow-x-auto border border-gray-200 rounded">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left font-medium text-gray-600 border-b border-gray-200">
                Company Name
              </th>
              <th className="px-4 py-2 text-left font-medium text-gray-600 border-b border-gray-200">
                Job Title
              </th>
              <th className="px-4 py-2 text-left font-medium text-gray-600 border-b border-gray-200">
                Location
              </th>
              <th className="px-4 py-2 text-left font-medium text-gray-600 border-b border-gray-200">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <React.Fragment key={job.id}>
                <tr
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleJobDetails(job.id)}
                >
                  <td className="px-4 py-3 border-b border-gray-200 text-gray-800">
                    {job.company_name}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200 text-gray-800">
                    {job.job_title}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200 text-gray-800">
                    {job.location}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200 text-gray-800 flex items-center space-x-2">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${
                        job.status === "applied"
                          ? "bg-yellow-500"
                          : job.status === "accepted"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    ></span>
                    <select
                      value={job.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        handleStatusChange(job.id, e.target.value);
                      }}
                      className="border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="applied">Applied</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
                {expandedJobId === job.id && (
                  <tr className="bg-gray-50">
                    <td
                      colSpan={4}
                      className="px-4 py-3 border-b border-gray-200"
                    >
                      <div className="space-y-2 text-black">
                        {job.application_url && (
                          <div>
                            <strong>Application URL:</strong>{" "}
                            <a
                              href={job.application_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-teal-700 hover:underline"
                            >
                              {job.application_url}
                            </a>
                          </div>
                        )}
                        {job.salary && (
                          <div>
                            <strong>Salary:</strong> ${job.salary}
                          </div>
                        )}

                        <button
                          onClick={() => confirmDelete(job.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-200"
                        >
                          Delete Job
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Job Modal */}
      {modalMounted &&
        createPortal(
          isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white text-black p-6 rounded shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Add a New Job</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label
                      htmlFor="company_name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company_name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="job_title"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Job Title
                    </label>
                    <input
                      type="text"
                      id="job_title"
                      name="job_title"
                      value={formData.job_title}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="applied_date"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Date Applied
                    </label>
                    <input
                      type="date"
                      id="applied_date"
                      name="applied_date"
                      value={formData.applied_date}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="application_url"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Application URL
                    </label>
                    <input
                      type="url"
                      id="application_url"
                      name="application_url"
                      value={formData.application_url}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="salary"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Salary
                    </label>
                    <input
                      type="number"
                      id="salary"
                      name="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-teal-700 text-white px-4 py-2 rounded hover:bg-teal-800 transition duration-200"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ),
          document.body
        )}
    </div>
  );
}
