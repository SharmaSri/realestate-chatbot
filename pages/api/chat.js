// pages/api/chat.js
import path from "path";
import fs from "fs";
import Papa from "papaparse";
import { parseQueryWithLLM } from "../../utils/queryParser"; // Make sure this exists
import { formatProjects } from "../../utils/formatProjects";

const csvFiles = [
  "Project.csv",
  "ProjectAddress.csv",
  "ProjectConfiguration.csv",
  "ProjectConfigurationVariant.csv"
];

// Optional: city/locality mappings
const cityMap = {
  "cmf6nu3ru000gvcxspxarll3v": "Mumbai",
  "cmf6nu3ru000gvcxspxarll4v": "Pune"
};

const localityMap = {
  "cmf6pksk30035vcxs7r2mo3iq": "Chembur",
  "cmf6pksk30035vcxs7r2mo3ir": "Wakad"
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: "Query is required" });

    // Parse user query using LLM
    const filters = await parseQueryWithLLM(query);

    // Load CSVs
    let allData = [];
    for (const fileName of csvFiles) {
      const filePath = path.join(process.cwd(), "public", fileName);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const results = Papa.parse(fileContent, { header: true }).data;

      // Debug log first row
      console.log(`Sample row from ${fileName}:`, results[0]);

      allData = allData.concat(results);
    }

    // Apply filters
    const filteredProjects = allData.filter(project => {
      let match = true;

      if (filters.city) {
        const cityName = cityMap[project.cityId]?.toLowerCase();
        match = match && cityName && cityName.includes(filters.city.toLowerCase());
      }

      if (filters.bhk) {
        match = match && project.bhk && project.bhk.includes(filters.bhk);
      }

      if (filters.budget) {
        const price = parseFloat(project.price);
        match = match && !isNaN(price) && price <= filters.budget;
      }

      if (filters.locality) {
        const localityName = localityMap[project.localityId]?.toLowerCase();
        match = match && localityName && localityName.includes(filters.locality.toLowerCase());
      }

      if (filters.projectName) {
        match = match && project.projectName && project.projectName.toLowerCase().includes(filters.projectName.toLowerCase());
      }

      return match;
    });

    // Format summary and cards
    const { summary, cards } = formatProjects(filteredProjects, cityMap, localityMap);

    res.status(200).json({ summary, cards });

  } catch (err) {
    console.error("Error in chat API:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
