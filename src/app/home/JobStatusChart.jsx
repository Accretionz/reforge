import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

// Register the required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const JobStatusChart = ({ jobs }) => {
  // Count jobs by status
  const statusCounts = jobs.reduce(
    (counts, job) => {
      const status = job.status || "applied"; // Default to applied if no status
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    },
    { applied: 0, accepted: 0, rejected: 0 }
  );

  const totalJobs = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  const data = {
    labels: ["Applied", "Accepted", "Rejected"],
    datasets: [
      {
        data: [
          statusCounts.applied,
          statusCounts.accepted,
          statusCounts.rejected,
        ],
        backgroundColor: [
          "rgba(54, 162, 235, 0.8)", // Blue for applied
          "rgba(75, 192, 192, 0.8)", // Green for accepted
          "rgba(255, 99, 132, 0.8)", // Red for rejected
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide the default legend as we'll create our own
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            const percentage = ((value / totalJobs) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Show message if no jobs
  if (jobs.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No job data available to display chart
      </div>
    );
  }

  return (
    <div className="w-full text-center">
      <div className="mb-2 text-gray-700 text-sm">
        Total Applications:{" "}
        <span className="font-bold text-blue-600">{totalJobs}</span>
      </div>
      <div className="h-44">
        <Pie data={data} options={options} />
      </div>

      {/* Custom legend */}
      <div className="mt-3 flex justify-center items-center space-x-4 text-sm">
        <div className="flex items-center text-black">
          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1.5"></span>
          <span>
            Applied: <span className="font-medium">{statusCounts.applied}</span>
          </span>
        </div>
        <div className="flex items-center text-black">
          <span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-1.5"></span>
          <span>
            Accepted:{" "}
            <span className="font-medium">{statusCounts.accepted}</span>
          </span>
        </div>
        <div className="flex items-center text-black">
          <span className="inline-block w-3 h-3 bg-red-400 rounded-full mr-1.5"></span>
          <span>
            Rejected:{" "}
            <span className="font-medium">{statusCounts.rejected}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default JobStatusChart;
