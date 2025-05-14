import React from "react";

const JobTable = ({
  jobs,
  expandedJobId,
  toggleJobDetails,
  handleStatusChange,
  confirmDelete,
}) => {
  // Function to get status styling
  const getStatusStyles = (status) => {
    switch (status) {
      case "applied":
        return "bg-blue-500 text-white";
      case "accepted":
        return "bg-green-500 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="grid grid-cols-1 gap-4 w-full">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer overflow-hidden w-full"
        >
          {/* Card Header */}
          <div onClick={() => toggleJobDetails(job.id)} className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="font-medium text-gray-800 text-base">
                    {job.company_name}
                  </h3>
                  <span className="mx-2 text-gray-800">-</span>
                  <p className="text-gray-800 font-medium">{job.job_title}</p>
                </div>
                <div className="flex items-center mt-1 text-sm">
                  <p className="text-gray-800">{job.location}</p>
                  <span className="mx-2 text-gray-800">-</span>
                  <p className="text-gray-800">
                    {formatDate(job.application_date || job.created_at)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="relative inline-block h-8">
                  <div className="flex items-center h-full">
                    <div
                      className={`px-3 py-1 rounded-md text-sm font-medium h-full flex items-center ${getStatusStyles(
                        job.status
                      )}`}
                    >
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1 inline"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  <select
                    value={job.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleStatusChange(job.id, e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
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
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {expandedJobId === job.id && (
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    {job.application_url && (
                      <div className="text-black">
                        <strong>Application URL:</strong>{" "}
                        <a
                          href={job.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-700 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {job.application_url}
                        </a>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(job.id);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-200"
                  >
                    Delete Job
                  </button>
                </div>

                {job.salary && (
                  <div className="text-black">
                    <strong>Salary:</strong> ${job.salary}
                  </div>
                )}
                {job.description && (
                  <div className="text-black">
                    <strong>Description:</strong>
                    <p className="mt-1">{job.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {jobs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No jobs found. Try adjusting your search or filter.
        </div>
      )}
    </div>
  );
};

export default JobTable;
