import axios from "axios";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

export async function fetchUserSubmissions(username) {
  console.log(`Fetching submissions for ${username}...`);
  try {
    const response = await axios.post(
      LEETCODE_GRAPHQL_URL,
      {
        query: `{ 
          recentSubmissionList(username: "${username}") { 
            title 
            titleSlug 
            timestamp 
            statusDisplay 
            lang 
          } 
        }`,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.data.recentSubmissionList;
  } catch (error) {
    console.error(`Error fetching submissions for ${username}:`, error);
    return [];
  }
}
