import { useState, useEffect } from "react";
import Head from "next/head";
import SubmissionCard from "../components/SubmissionCard";
import AddUserForm from "../components/AddUserForm";
import LeaderboardStats from "../components/LeaderboardStats";
import { filterSubmissionsByDate } from "../utils/date-utils";

export default function Home() {
  const [users, setUsers] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

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

  // Calculate user rankings based on today's accepted submissions
  const calculateRankings = () => {
    return users
      .map((user) => {
        const submissions = userSubmissions[user.username] || [];
        const today = new Date().toDateString();

        const todayAccepted = submissions.filter((sub) => {
          const subDate = new Date(parseInt(sub.timestamp) * 1000);
          return (
            subDate.toDateString() === today && sub.statusDisplay === "Accepted"
          );
        }).length;

        return {
          ...user,
          todayAccepted,
        };
      })
      .sort((a, b) => b.todayAccepted - a.todayAccepted);
  };

  const rankedUsers = calculateRankings();

  return (
    <div className="min-h-screen bg-gray-100 ">
      <Head>
        <title>LeetCode Competitive Tracker</title>
        <meta
          name="description"
          content="Track and compete with peers on LeetCode"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="max-w-lg mx-auto px-4 py-6 sm:px-6 lg:max-w-xl">
        <header className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">LeetCode Arena</h1>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700"
            >
              {showAddForm ? "Hide Form" : "+ Add User"}
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-600">
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
                    <SubmissionCard
                      key={user.username}
                      user={user}
                      submissions={userSubmissions[user.username] || []}
                      rank={index}
                    />
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
