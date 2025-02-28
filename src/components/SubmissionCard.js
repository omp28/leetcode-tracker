import { useState } from "react";
import { formatTimestamp } from "../utils/date-utils";

export default function SubmissionCard({ user, submissions }) {
  const [expanded, setExpanded] = useState(false);

  const todaySubmissions = submissions.filter((sub) => {
    const submissionDate = new Date(parseInt(sub.timestamp) * 1000);
    const today = new Date();
    return submissionDate.toDateString() === today.toDateString();
  });

  const submissionsByStatus = {
    accepted: submissions.filter((sub) => sub.statusDisplay === "Accepted"),
    failed: submissions.filter((sub) => sub.statusDisplay !== "Accepted"),
  };

  return (
    <div className="border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-lg font-bold">
          {user.displayName || user.username}
        </h3>
        <div className="flex space-x-4">
          <div className="text-sm">
            <span className="font-semibold text-green-600">
              {submissionsByStatus.accepted.length}
            </span>{" "}
            accepted
          </div>
          <div className="text-sm">
            <span className="font-semibold">{todaySubmissions.length}</span>{" "}
            today
          </div>
          <button className="text-blue-500">{expanded ? "↑" : "↓"}</button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-2">
          <h4 className="font-semibold">Recent Submissions:</h4>
          {submissions.length === 0 ? (
            <p className="text-gray-500 italic">No submissions found</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {submissions.map((submission, index) => (
                <div
                  key={index}
                  className={`p-2 border rounded ${
                    submission.statusDisplay === "Accepted"
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{submission.title}</span>
                    <span
                      className={`text-sm ${
                        submission.statusDisplay === "Accepted"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {submission.statusDisplay}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>Language: {submission.lang}</span>
                    <span>{formatTimestamp(submission.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
