import { projects, projectAddresses, projectConfigs, projectConfigVariants } from "../../utils/loadProjects";

export default async function handler(req, res) {
  try {
    const { message } = req.body;

    // Basic text matching for city or BHK
    const userText = message.toLowerCase();

    const results = searchProjects(userText);

    if (results.length === 0) {
      return res.status(200).json({
        answer: "No matching projects found for your query.",
        projects: [],
      });
    }

    return res.status(200).json({
      answer: `Found ${results.length} project(s) matching your query.`,
      projects: results,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}

function searchProjects(query) {
  return projects.filter((project) => {
    const city = project?.City?.toLowerCase() || "";
    const name = project?.ProjectName?.toLowerCase() || "";
    const bhk = query.includes("1 bhk")
      ? "1 bhk"
      : query.includes("2 bhk")
      ? "2 bhk"
      : query.includes("3 bhk")
      ? "3 bhk"
      : "";

    // Match city or name
    if (query.includes(city) || query.includes(name)) return true;

    // Optional: match configuration if needed
    if (bhk) {
      const matchingConfigs = projectConfigs.filter(
        (c) =>
          c.ProjectID === project.ProjectID &&
          c.CustomBHK.toLowerCase().includes(bhk)
      );
      return matchingConfigs.length > 0;
    }

    return false;
  });
}
