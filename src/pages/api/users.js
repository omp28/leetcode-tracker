import fs from "fs";
import path from "path";

const usersFilePath = path.join(process.cwd(), "data/users.json");

export default async function handler(req, res) {
  // GET request - return list of users
  if (req.method === "GET") {
    try {
      const usersData = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
      return res.status(200).json(usersData);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  // POST request - add a new user
  if (req.method === "POST") {
    try {
      const { username, displayName } = req.body;

      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }

      const usersData = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
      const userExists = usersData.users.some(
        (user) => user.username === username
      );

      if (userExists) {
        return res.status(400).json({ error: "User already exists" });
      }

      usersData.users.push({
        username,
        displayName: displayName || username,
      });

      fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));
      return res.status(201).json({ message: "User added successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Failed to add user" });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: "Method not allowed" });
}
