// pages/api/chat.js

import fs from "fs";
import path from "path";
import Papa from "papaparse";
import OpenAI from "openai";

// Make sure your OPENAI_API_KEY is set in Render environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// List of CSV files in public/
const csvFiles = [
  "Project.csv",
  "ProjectConfiguration.csv",
  "ProjectConfigurationVariant.csv",
  "ProjectAmenities.csv",
];

// Function to parse user query using OpenAI
async function parseQueryWithLLM(query) {
  const prompt = `
You are a real estate assistant.
Extract filters from the user query:
- City
- BHK
- Budget
- Readiness (Ready / Under Construction)
- Locality
- Project Name (optional)
Return JSON only, e.g.
{
  "city": "Pune",
  "bhk": "2BHK",
  "budget": 1.5,
  "readiness": "Ready",
  "locality": "Wakad",
  "projectName": ""
}
Query: "${query}"
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0].message.content;

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse LLM response:", text);
    return {};
  }
}

// API handler
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: "Query is required" });

    // Parse user query
    const filters = await parseQueryWithLLM(query);

    // Load CSVs
    let allData = [];
    for (const fileName of csvFiles) {
      const filePath = path.join(process.cwd(), "public", fileName);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const results = Papa.parse(fileContent, { header: true }).data;
      allData = allData.concat(results);
    }

    // Filter data based on extracted filters
    let filtered = allData;

    if (filters.city) {
      filtered = filtered.filter(
        (row) => row.city?.toLowerCase() === filters.city.toLowerCase()
      );
    }
    if (filters.bhk) {
      filtered = filtered.filter((row) => row.bhk?.includes(filters.bhk));
    }
    if (filters.budget) {
      filtered = filtered.filter((row) => parseFloat(row.price) <= filters.budget);
    }
    if (filters.readiness) {
      filtered = filtered.filter(
        (row) => row.status?.toLowerCase() === filters.readiness.toLowerCase()
      );
    }
    if (filters.locality) {
      filtered = filtered.filter(
        (row) => row.locality?.toLowerCase().includes(filters.locality.toLowerCase())
      );
    }
    if (filters.projectName) {
      filtered = filtered.filter(
        (row) => row.projectName?.toLowerCase().includes(filters.projectName.toLowerCase())
      );
    }

    // Generate summary
    let summary = "";
    if (filtered.length > 0) {
      const sample = filtered[0];
      summary = `Found ${filtered.length} listings. Example: ${sample.bhk} in ${sample.locality}, ${sample.city} for ₹${sample.price} Cr, ${sample.status}.`;
    } else {
      summary = "No matching properties found. Try expanding your search criteria.";
    }

    res.status(200).json({ summary, results: filtered });
  } catch (err) {
    console.error("Error in chat API:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
