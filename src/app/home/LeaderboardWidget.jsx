import React, { useState } from "react";

const LeaderboardWidget = ({
  weeklyLeaderboard,
  overallLeaderboard,
  currentUserEmail,
}) => {
  const [timeRange, setTimeRange] = useState("week"); // Default to "week"

  // Choose which leaderboard to display based on selected time range
  const displayLeaderboard =
    timeRange === "week" ? weeklyLeaderboard : overallLeaderboard;

  return (
    <div>
      <h3 className="text-gray-700 font-medium mb-4 text-center text-lg">
        Leaderboard
      </h3>

      {/* Time range selector */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setTimeRange("week")}
          className={`mr-1 px-4 py-1.5 text-sm rounded-md ${
            timeRange === "week"
              ? "bg-green-500 text-white font-medium"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Past Week
        </button>
        <button
          onClick={() => setTimeRange("all")}
          className={`ml-1 px-4 py-1.5 text-sm rounded-md ${
            timeRange === "all"
              ? "bg-green-500 text-white font-medium"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          All Time
        </button>
      </div>

      {/* Leaderboard list */}
      <div className="space-y-1">
        {displayLeaderboard.slice(0, 5).map((user, index) => {
          // Check if this entry is the current user
          const isCurrentUser = user.email === currentUserEmail;

          // Set background colors based on position
          let bgColor;
          let customStyle = {};
          if (index === 0) bgColor = "bg-yellow-200 border-yellow-400";
          else if (index === 1) bgColor = "bg-gray-200 border-gray-300";
          else if (index === 2) {
            bgColor = "";
            customStyle = {
              backgroundColor: "#CD7F32",
              borderColor: "#CD7F32",
            };
          } else bgColor = "bg-white border-gray-200";

          return (
            <div
              key={user.email}
              className={`flex justify-between items-center px-4 py-3 border ${bgColor} ${
                isCurrentUser ? "border-blue-500 border-2" : "border"
              } rounded-md text-black`}
              style={customStyle}
            >
              <span className="text-sm font-medium">
                {index + 1}. {user.email.split("@")[0]}
              </span>
              <span className="text-sm font-bold">
                {user.jobCount} {user.jobCount === 1 ? "job" : "jobs"}
              </span>
            </div>
          );
        })}

        {/* If the list is empty */}
        {displayLeaderboard.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardWidget;
