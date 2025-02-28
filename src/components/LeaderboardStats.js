import { useState } from "react";

export default function LeaderboardStats({ users, userSubmissions }) {
  const [timeframe, setTimeframe] = useState("today");

  // Calculate submissions and rankings for each timeframe
  const calculateStats = () => {
    const stats = users.map((user) => {
      const submissions = userSubmissions[user.username] || [];

      // Get accepted submissions for each timeframe
      const accepted = {
        today: countSubmissionsByTimeframe(submissions, 0, 1, "Accepted"),
        yesterday: countSubmissionsByTimeframe(submissions, 1, 2, "Accepted"),
        thisWeek: countSubmissionsByTimeframe(submissions, 0, 7, "Accepted"),
        total: submissions.filter((s) => s.statusDisplay === "Accepted").length,
      };

      // Get total submissions for each timeframe
      const total = {
        today: countSubmissionsByTimeframe(submissions, 0, 1),
        yesterday: countSubmissionsByTimeframe(submissions, 1, 2),
        thisWeek: countSubmissionsByTimeframe(submissions, 0, 7),
        total: submissions.length,
      };

      return {
        username: user.username,
        displayName: user.displayName || user.username,
        accepted,
        total,
      };
    });

    // Sort by the selected timeframe's accepted count (descending)
    return stats.sort((a, b) => b.accepted[timeframe] - a.accepted[timeframe]);
  };

  // Helper to count submissions in a given timeframe
  const countSubmissionsByTimeframe = (
    submissions,
    daysAgo,
    daysRange,
    status = null
  ) => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - daysAgo);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() - daysRange);
    endDate.setHours(0, 0, 0, 0);

    return submissions.filter((sub) => {
      const subDate = new Date(parseInt(sub.timestamp) * 1000);
      const isInTimeframe = subDate >= endDate && subDate < startDate;
      return status
        ? isInTimeframe && sub.statusDisplay === status
        : isInTimeframe;
    }).length;
  };

  const rankings = calculateStats();

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Leaderboard</h2>

        <div className="flex space-x-2">
          <TimeframeButton
            active={timeframe === "today"}
            onClick={() => setTimeframe("today")}
            label="Today"
          />
          <TimeframeButton
            active={timeframe === "yesterday"}
            onClick={() => setTimeframe("yesterday")}
            label="Yesterday"
          />
          <TimeframeButton
            active={timeframe === "thisWeek"}
            onClick={() => setTimeframe("thisWeek")}
            label="This Week"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {rankings.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No users found</div>
        ) : (
          <div className="divide-y">
            {rankings.map((user, index) => (
              <div key={user.username} className="flex items-center p-3">
                <div
                  className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center mr-3 ${getRankColor(
                    index
                  )}`}
                >
                  <span className="text-white font-bold">{index + 1}</span>
                </div>

                <div className="flex-grow min-w-0">
                  <h3 className="font-medium truncate">{user.displayName}</h3>
                </div>

                <div className="flex items-center">
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {user.accepted[timeframe]}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.total[timeframe]} total
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TimeframeButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-sm rounded-full ${
        active
          ? "bg-blue-600 text-white"
          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
      }`}
    >
      {label}
    </button>
  );
}

function getRankColor(rank) {
  switch (rank) {
    case 0:
      return "bg-yellow-500"; // Gold
    case 1:
      return "bg-gray-400"; // Silver
    case 2:
      return "bg-amber-600"; // Bronze
    default:
      return "bg-blue-500"; // Others
  }
}
