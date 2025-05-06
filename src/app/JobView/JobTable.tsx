import React from "react";

interface Job {
  id: string;
  job_title: string;
  company_name: string;
  location: string;
  status: string;
  application_url?: string;
  salary?: string;
}

interface JobTableProps {
  jobs: Job[];
  expandedJobId: string | null;
  toggleJobDetails: (jobId: string) => void;
  handleStatusChange: (jobId: string, newStatus: string) => void;
  confirmDelete: (jobId: string) => void;
}

const JobTable: React.FC<JobTableProps> = ({
  jobs,
  expandedJobId,
  toggleJobDetails,
  handleStatusChange,
  confirmDelete,
}) => {
  return (
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
          {jobs.map((job) => (
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
  );
};

export default JobTable;
