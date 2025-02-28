import { useState, useEffect } from "react";
import Head from "next/head";
import SubmissionCard from "../components/SubmissionCard";
import AddUserForm from "../components/AddUserForm";
import LeaderboardStats from "../components/LeaderboardStats";
import { filterSubmissionsByDate, isAfter5AM } from "../utils/date-utils";

export default function Home() {
  const [users, setUsers] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedUser, setExpandedUser] = useState(null);

  // Fetch users and their submissions
  const fetchData = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Fetch users
      const usersResponse = await fetch("/api/users");
      if (!usersResponse.ok) {
        throw new Error("Failed to fetch users");
      }

      const usersData = await usersResponse.json();
      setUsers(usersData.users);

      // Fetch submissions for each user
      const submissionsData = {};

      for (const user of usersData.users) {
        const submissionsResponse = await fetch(
          `/api/submissions?username=${user.username}`
        );
        if (submissionsResponse.ok) {
          const data = await submissionsResponse.json();
          submissionsData[user.username] = data.submissions || [];
        }
      }

      setUserSubmissions(submissionsData);
    } catch (error) {
      setError("Failed to load data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Calculate user rankings based on today's accepted submissions (after 5 AM)
  const calculateRankings = () => {
    return users
      .map((user) => {
        const submissions = userSubmissions[user.username] || [];
        const todaySubmissions = submissions.filter((sub) => {
          const subDate = new Date(parseInt(sub.timestamp) * 1000);
          return isAfter5AM(subDate) && sub.statusDisplay === "Accepted";
        });

        return {
          ...user,
          todayAccepted: todaySubmissions.length,
          todaySubmissions, // Store today's submissions for display
        };
      })
      .sort((a, b) => b.todayAccepted - a.todayAccepted);
  };

  const rankedUsers = calculateRankings();

  const handleExpand = (username) => {
    setExpandedUser(expandedUser === username ? null : username);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Head>
        <title>LeetCode Competitive Tracker</title>
        <meta
          name="description"
          content="Track and compete with peers on LeetCode"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6">
        <header className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">LeetCode Arena</h1>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showAddForm ? "Hide Form" : "+ Add User"}
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Daily competition to solve more problems
          </p>
        </header>

        {showAddForm && (
          <div className="mb-6">
            <AddUserForm
              onUserAdded={() => {
                fetchData();
                setShowAddForm(false);
              }}
            />
          </div>
        )}

        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading submissions...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {users.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-600">
                  No users added yet. Add a LeetCode user to start competing!
                </p>
              </div>
            ) : (
              <>
                <LeaderboardStats
                  users={users}
                  userSubmissions={userSubmissions}
                />

                <div className="space-y-4 mb-6">
                  {rankedUsers.map((user, index) => (
                    <div
                      key={user.username}
                      className="bg-white rounded-lg shadow"
                    >
                      <div
                        className="flex items-center p-4 cursor-pointer"
                        onClick={() => handleExpand(user.username)}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${getRankColor(
                            index
                          )}`}
                        >
                          <span className="text-white font-bold">
                            {index + 1}
                          </span>
                        </div>

                        <div className="flex-grow">
                          <h3 className="font-bold">
                            {user.displayName || user.username}
                          </h3>
                          <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                            {user.todayAccepted > 0 && (
                              <div className="flex items-center">
                                <span className="text-green-600">✔</span>
                                <span className="ml-1">
                                  {user.todayAccepted} today
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <button
                            className={`text-blue-500 transition-transform duration-200 ${
                              expandedUser === user.username
                                ? "transform rotate-180"
                                : ""
                            }`}
                            aria-label={
                              expandedUser === user.username
                                ? "Collapse"
                                : "Expand"
                            }
                          >
                            ↓
                          </button>
                        </div>
                      </div>

                      {expandedUser === user.username && (
                        <div className="px-4 pb-4">
                          <div className="border-t pt-3">
                            <h4 className="font-medium text-sm mb-2">
                              Today&apos;s Submissions:
                            </h4>

                            {user.todaySubmissions.length === 0 ? (
                              <p className="text-gray-500 italic text-sm">
                                No submissions today (after 5 AM).
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {user.todaySubmissions.map(
                                  (submission, index) => (
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
                                            submission.statusDisplay ===
                                            "Accepted"
                                              ? "text-green-600"
                                              : "text-red-600"
                                          }`}
                                        >
                                          {submission.statusDisplay}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                                        <span>{submission.lang}</span>
                                        <span>
                                          {formatTimestamp(
                                            submission.timestamp
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            )}

                            <div className="mt-4 text-center">
                              <a
                                href={`/user/${user.username}`}
                                className="text-blue-600 hover:underline"
                              >
                                View all submissions →
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <footer className="py-6 text-center text-sm text-gray-500">
        <p>LeetCode Arena &copy; {new Date().getFullYear()}</p>
      </footer>
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
