import { useState, useEffect } from "react";
import Head from "next/head";
import SubmissionCard from "../components/SubmissionCard";
import AddUserForm from "../components/AddUserForm";
import StatisticsSection from "../components/StatisticsSection";
import { filterSubmissionsByDate } from "../utils/date-utils";

export default function Home() {
  const [users, setUsers] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

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

      // Set first user as selected if available and none selected
      if (usersData.users.length > 0 && !selectedUser) {
        setSelectedUser(usersData.users[0].username);
      }
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

  // Get submissions for selected user
  const selectedUserSubmissions = selectedUser
    ? userSubmissions[selectedUser] || []
    : [];
  const submissionsByPeriod = filterSubmissionsByDate(selectedUserSubmissions);

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <Head>
        <title>LeetCode Progress Tracker</title>
        <meta name="description" content="Track your LeetCode progress" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            LeetCode Progress Tracker
          </h1>
          <p className="mt-2 text-gray-600">
            Keep track of your LeetCode journey
          </p>
        </header>

        <AddUserForm onUserAdded={fetchData} />

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div>
            {users.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600">
                  No users added yet. Add a LeetCode user to get started!
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <label
                    htmlFor="userSelect"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Select User for Statistics:
                  </label>
                  <select
                    id="userSelect"
                    value={selectedUser || ""}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full md:w-64 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {users.map((user) => (
                      <option key={user.username} value={user.username}>
                        {user.displayName || user.username}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedUser && (
                  <StatisticsSection
                    submissionsByPeriod={submissionsByPeriod}
                  />
                )}

                <h2 className="text-xl font-bold mb-4">All Users</h2>

                <div className="space-y-4">
                  {users.map((user) => (
                    <SubmissionCard
                      key={user.username}
                      user={user}
                      submissions={userSubmissions[user.username] || []}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="mt-12 py-6 bg-gray-100">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>LeetCode Progress Tracker &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
