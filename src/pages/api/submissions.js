import { fetchUserSubmissions } from "../../utils/leetcode-api";

export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const submissions = await fetchUserSubmissions(username);
    return res.status(200).json({ submissions });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch submissions" });
  }
}
