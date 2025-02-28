import { useState } from "react";
import { formatTimestamp } from "../utils/date-utils";

export default function SubmissionCard({ user, submissions, rank }) {
  const [expanded, setExpanded] = useState(false);

  // Count today's submissions
  const todaySubmissions = submissions.filter((sub) => {
    const submissionDate = new Date(parseInt(sub.timestamp) * 1000);
    const today = new Date();
    return submissionDate.toDateString() === today.toDateString();
  });

  // Count accepted submissions
  const acceptedSubmissions = submissions.filter(
    (sub) => sub.statusDisplay === "Accepted"
  );
  const todayAccepted = todaySubmissions.filter(
    (sub) => sub.statusDisplay === "Accepted"
  );

  // Get submission streak (consecutive days)
  const getStreak = () => {
    if (submissions.length === 0) return 0;

    const dates = new Set();
    submissions.forEach((sub) => {
      const date = new Date(parseInt(sub.timestamp) * 1000).toDateString();
      dates.add(date);
    });

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      // Check up to 30 days back
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);

      if (dates.has(checkDate.toDateString())) {
        streak++;
      } else if (i === 0) {
        // If no submissions today, streak is broken
        return 0;
      } else {
        // Stop counting at first gap
        break;
      }
    }

    return streak;
  };

  const streak = getStreak();

  return (
    <div
      className={`border rounded-lg shadow-sm hover:shadow transition-shadow ${
        rank <= 2 ? "border-yellow-200 bg-yellow-50" : ""
      }`}
    >
      <div
        className="flex items-center p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Rank badge */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${getRankColor(
            rank
          )}`}
        >
          <span className="text-white font-bold">{rank + 1}</span>
        </div>

        {/* User info */}
        <div className="flex-grow">
          <h3 className="font-bold">{user.displayName || user.username}</h3>
          <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
            {streak > 0 && (
              <div className="flex items-center">
                <span className="text-orange-500">🔥</span>
                <span className="ml-1">{streak} day streak</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-sm font-semibold text-green-600">
              {todayAccepted.length}
            </div>
            <div className="text-xs text-gray-500">today</div>
          </div>

          <div className="text-center">
            <div className="text-sm font-semibold">
              {acceptedSubmissions.length}
            </div>
            <div className="text-xs text-gray-500">total</div>
          </div>

          <div>
            <button
              className={`text-blue-500 transition-transform duration-200 ${
                expanded ? "transform rotate-180" : ""
              }`}
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              ↓
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4">
          <div className="border-t pt-3">
            <h4 className="font-medium text-sm mb-2">Recent Submissions:</h4>

            {submissions.length === 0 ? (
              <p className="text-gray-500 italic text-sm">
                No submissions found
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {submissions.slice(0, 10).map((submission, index) => (
                  <div
                    key={index}
                    className={`p-2 border rounded text-sm ${
                      submission.statusDisplay === "Accepted"
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium truncate mr-2">
                        {submission.title}
                      </span>
                      <span
                        className={`whitespace-nowrap ${
                          submission.statusDisplay === "Accepted"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {submission.statusDisplay}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>{submission.lang}</span>
                      <span>{formatTimestamp(submission.timestamp)}</span>
                    </div>
                  </div>
                ))}

                {submissions.length > 10 && (
                  <div className="text-center text-sm text-blue-600 mt-2">
                    +{submissions.length - 10} more submissions
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
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
