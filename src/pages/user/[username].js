// pages/user/[username].js

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import {
  filterSubmissionsByDate,
  getDayCountFromTimestamps,
  calculateStreak,
} from "../../utils/date-utils";

export default function UserProfile() {
  const router = useRouter();
  const { username } = router.query;

  const [userData, setUserData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!username) return;

    const fetchUserData = async () => {
      setIsLoading(true);
      setError("");

      try {
        // Fetch user info
        const usersResponse = await fetch("/api/users");
        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users");
        }

        const usersData = await usersResponse.json();
        const user = usersData.users.find((u) => u.username === username);

        if (!user) {
          throw new Error("User not found");
        }

        setUserData(user);

        // Fetch user submissions
        const submissionsResponse = await fetch(
          `/api/submissions?username=${username}`
        );
        if (!submissionsResponse.ok) {
          throw new Error("Failed to fetch submissions");
        }

        const data = await submissionsResponse.json();
        setSubmissions(data.submissions || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-700 mb-6">{error}</p>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  // Analysis
  const submissionsByPeriod = filterSubmissionsByDate(submissions);
  const streak = calculateStreak(submissions);
  const totalDays = getDayCountFromTimestamps(submissions);

  const acceptedSubmissions = submissions.filter(
    (sub) => sub.statusDisplay === "Accepted"
  );
  const totalAccepted = acceptedSubmissions.length;
  const acceptedRate =
    submissions.length > 0
      ? Math.round((totalAccepted / submissions.length) * 100)
      : 0;

  // Language statistics
  const languageStats = submissions.reduce((acc, sub) => {
    acc[sub.lang] = (acc[sub.lang] || 0) + 1;
    return acc;
  }, {});

  const sortedLanguages = Object.entries(languageStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>
          {userData.displayName || userData.username} - LeetCode Tracker
        </title>
        <meta
          name="description"
          content={`LeetCode stats for ${userData.username}`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="max-w-lg mx-auto px-4 py-6 sm:px-6 lg:max-w-xl">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:underline flex items-center"
          >
            <span>← Back to Leaderboard</span>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold">
              {userData.displayName || userData.username}
            </h1>
            <p className="text-gray-500 text-sm mt-1">@{userData.username}</p>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <StatCard label="Total Solved" value={totalAccepted} />
              <StatCard label="Success Rate" value={`${acceptedRate}%`} />
              <StatCard label="Current Streak" value={streak} />
              <StatCard label="Active Days" value={totalDays} />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-3">Recent Activity</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <ActivityCard
                  label="Today"
                  value={submissionsByPeriod.today.length}
                  accepted={
                    submissionsByPeriod.today.filter(
                      (s) => s.statusDisplay === "Accepted"
                    ).length
                  }
                />
                <ActivityCard
                  label="Yesterday"
                  value={submissionsByPeriod.yesterday.length}
                  accepted={
                    submissionsByPeriod.yesterday.filter(
                      (s) => s.statusDisplay === "Accepted"
                    ).length
                  }
                />
                <ActivityCard
                  label="This Week"
                  value={submissionsByPeriod.thisWeek.length}
                  accepted={
                    submissionsByPeriod.thisWeek.filter(
                      (s) => s.statusDisplay === "Accepted"
                    ).length
                  }
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-3">Favorite Languages</h3>
              {sortedLanguages.length > 0 ? (
                <div className="space-y-2">
                  {sortedLanguages.map(([lang, count]) => (
                    <div key={lang} className="flex items-center">
                      <div className="w-24 text-sm">{lang}</div>
                      <div className="flex-grow">
                        <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full"
                            style={{
                              width: `${(count / submissions.length) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-12 text-right text-sm">{count}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No submissions yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs for detailed view */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <div className="flex">
              <TabButton
                active={activeTab === "overview"}
                onClick={() => setActiveTab("overview")}
                label="Overview"
              />
              <TabButton
                active={activeTab === "submissions"}
                onClick={() => setActiveTab("submissions")}
                label="Submissions"
              />
              <TabButton
                active={activeTab === "analysis"}
                onClick={() => setActiveTab("analysis")}
                label="Analysis"
              />
            </div>
          </div>

          <div className="p-4">
            {activeTab === "overview" && (
              <div>
                <h3 className="font-medium mb-2">Activity Summary</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {userData.displayName || userData.username} has completed{" "}
                  {totalAccepted} problems with a {acceptedRate}% success rate
                  over {totalDays} active days.
                </p>

                <h3 className="font-medium mb-2 mt-4">Recent Achievements</h3>
                {streak > 2 && (
                  <div className="flex items-center text-sm mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <span className="text-orange-500 mr-2">🔥</span>
                    <span>On a {streak} day streak!</span>
                  </div>
                )}

                {submissionsByPeriod.today.length > 2 && (
                  <div className="flex items-center text-sm mb-2 p-2 bg-green-50 border border-green-200 rounded">
                    <span className="text-green-500 mr-2">🚀</span>
                    <span>
                      Solved{" "}
                      {
                        submissionsByPeriod.today.filter(
                          (s) => s.statusDisplay === "Accepted"
                        ).length
                      }{" "}
                      problems today!
                    </span>
                  </div>
                )}

                {totalAccepted > 0 && acceptedRate > 70 && (
                  <div className="flex items-center text-sm mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <span className="text-blue-500 mr-2">🏆</span>
                    <span>High success rate: {acceptedRate}%</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === "submissions" && (
              <div>
                <h3 className="font-medium mb-3">All Submissions</h3>
                {submissions.length === 0 ? (
                  <p className="text-gray-500 italic">No submissions found</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {submissions
                      .sort(
                        (a, b) => parseInt(b.timestamp) - parseInt(a.timestamp)
                      )
                      .map((submission, index) => (
                        <div
                          key={index}
                          className={`p-3 border rounded ${
                            submission.statusDisplay === "Accepted"
                              ? "border-green-200 bg-green-50"
                              : "border-red-200 bg-red-50"
                          }`}
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {submission.title}
                            </span>
                            <span
                              className={`${
                                submission.statusDisplay === "Accepted"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {submission.statusDisplay}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 mt-1">
                            <span>{submission.lang}</span>
                            <span>
                              {new Date(
                                parseInt(submission.timestamp) * 1000
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "analysis" && (
              <div>
                <h3 className="font-medium mb-3">Submission Patterns</h3>

                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Daily Activity</h4>
                  <div className="bg-gray-100 p-3 rounded">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-gray-500">
                        Least Active
                      </span>
                      <span className="text-xs text-gray-500">Most Active</span>
                    </div>

                    <div className="flex space-x-1">
                      {/* Placeholder for activity heat map - would be better with real data */}
                      {Array(7)
                        .fill(0)
                        .map((_, i) => {
                          // Random activity level for demo
                          const activityLevel = Math.floor(Math.random() * 4);
                          return (
                            <div key={i} className="flex-1">
                              <div
                                className={`w-full h-4 rounded ${
                                  activityLevel === 0
                                    ? "bg-gray-200"
                                    : activityLevel === 1
                                    ? "bg-green-200"
                                    : activityLevel === 2
                                    ? "bg-green-400"
                                    : "bg-green-600"
                                }`}
                              ></div>
                            </div>
                          );
                        })}
                    </div>

                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">Sun</span>
                      <span className="text-xs text-gray-500">Sat</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Problem Difficulty
                  </h4>
                  {/* This would require adding difficulty data to the submissions */}
                  <p className="text-sm text-gray-500 italic">
                    Difficulty analysis not available. Add difficulty data to
                    submissions to enable this feature.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="py-6 text-center text-sm text-gray-500">
        <p>LeetCode Arena &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

// Helper Components
function StatCard({ label, value }) {
  return (
    <div className="bg-gray-50 p-3 rounded border">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function ActivityCard({ label, value, accepted }) {
  return (
    <div className="bg-gray-50 p-3 rounded border">
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className="flex justify-between items-end">
        <div className="text-lg font-bold">{value}</div>
        {value > 0 && (
          <div className="text-xs text-green-600">{accepted} passed</div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium ${
        active
          ? "text-blue-600 border-b-2 border-blue-600"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}
