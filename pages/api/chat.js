// pages/api/chat.js
import fs from "fs";
import path from "path";
import Papa from "papaparse";

// Load CSVs once
const loadCSV = (filename) => {
  const filePath = path.join(process.cwd(), "public", filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Could not read ${filename}: ENOENT`);
    return [];
  }
  const file = fs.readFileSync(filePath, "utf8");
  const { data } = Papa.parse(file, { header: true, skipEmptyLines: true });
  return data;
};

// Load CSVs
const projects = loadCSV("Project.csv");
const addresses = loadCSV("ProjectAddress.csv");
const configurations = loadCSV("ProjectConfiguration.csv");
const variants = loadCSV("ProjectConfigurationVariant.csv");

// Create lookup maps
const cityMap = {};
const localityMap = {};
addresses.forEach(a => {
  if (a.cityId) cityMap[a.cityId] = a.fullAddress?.split(",")[0] || "Unknown City";
  if (a.localityId) localityMap[a.localityId] = a.fullAddress?.split(",")[1]?.trim() || "Unknown Locality";
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: "Query is required" });

    // --- Parse query manually or via your LLM ---
    // For demo, very basic parsing
    const lower = query.toLowerCase();
    const city = lower.match(/pune|mumbai|bangalore|delhi/)?.[0];
    const bhk = parseInt(lower.match(/(\d)bhk/)?.[1]);
    const budgetMatch = lower.match(/under\s*₹?(\d+(\.\d+)?)\s*cr/);
    const budget = budgetMatch ? parseFloat(budgetMatch[1]) * 1e7 : null;
    const status = lower.includes("ready") ? "READY" : lower.includes("under construction") ? "UNDER_CONSTRUCTION" : null;

    // --- Filter projects ---
    const results = projects.filter(p => {
      // City filter
      if (city && cityMap[p.cityId]?.toLowerCase() !== city) return false;

      // BHK filter
      const config = configurations.find(c => c.projectId === p.id);
      if (bhk && config && parseInt(config.customBHK) !== bhk) return false;

      // Price filter
      const variant = variants.find(v => v.configurationId === (config?.id || ""));
      if (budget && variant && parseFloat(variant.price) > budget) return false;

      // Status filter
      if (status && p.status !== status) return false;

      return true;
    });

    // --- Create cards ---
    const cards = results.map(p => {
      const config = configurations.find(c => c.projectId === p.id);
      const variant = variants.find(v => v.configurationId === (config?.id || ""));
      const addr = addresses.find(a => a.projectId === p.id);
      return {
        title: p.projectName,
        projectName: p.projectName,
        city: cityMap[p.cityId] || "Unknown City",
        locality: localityMap[p.localityId] || "Unknown Locality",
        BHK: config?.customBHK + "BHK" || "N/A",
        price: variant?.price ? `₹${(variant.price / 1e7).toFixed(2)} Cr` : "N/A",
        possession: p.status === "READY" ? "Ready-to-move" : "Under Construction",
        amenities: ["Lift", "Parking"], // you can extend from variant/furnishingType
        slug: p.slug
      };
    });

    // --- Summary ---
    let summary = "No properties found matching your criteria.";
    if (cards.length > 0) {
      summary = `${cards.length} properties found`;
      if (city) summary += ` in ${city.charAt(0).toUpperCase() + city.slice(1)}`;
      if (bhk) summary += ` with ${bhk}BHK`;
      if (budget) summary += ` under ₹${(budget / 1e7).toFixed(2)} Cr`;
    }

    res.status(200).json({ summary, cards });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
}
