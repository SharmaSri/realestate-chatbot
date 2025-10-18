import fs from "fs";
import path from "path";
import Papa from "papaparse";

// CSV files in public folder
const csvFiles = {
  projects: "Project.csv",
  addresses: "ProjectAddress.csv",
  configs: "ProjectConfiguration.csv",
  variants: "ProjectConfigurationVariant.csv",
};

// Helper to parse budget string to number
function parseBudget(str) {
  if (!str) return null;
  const num = str.replace(/[^0-9.]/g, "");
  return num ? parseFloat(num) : null;
}

// Simple regex-based query parser
function parseQuery(query) {
  const lower = query.toLowerCase();
  const cityMatch = lower.match(/\b(mumbai|pune|bangalore|delhi|chennai|hyderabad)\b/);
  const bhkMatch = lower.match(/(\d+)\s*bhk/);
  const budgetMatch = lower.match(/under\s*₹?\s*([\d.]+)\s*(cr|l)?/);

  let budget = null;
  if (budgetMatch) {
    budget = parseFloat(budgetMatch[1]);
    if (budgetMatch[2] === "cr") budget *= 1e7; // convert Cr to L
    else if (!budgetMatch[2] || budgetMatch[2] === "l") budget *= 1e5; // convert L to units
  }

  const status = lower.includes("ready") ? "READY" : lower.includes("under construction") ? "UNDER_CONSTRUCTION" : null;

  return {
    city: cityMatch ? cityMatch[0] : null,
    bhk: bhkMatch ? bhkMatch[1] : null,
    budget,
    status,
  };
}

// Read CSV and return data
function readCSV(fileName) {
  const filePath = path.join(process.cwd(), "public", fileName);
  const fileContent = fs.readFileSync(filePath, "utf8");
  return Papa.parse(fileContent, { header: true }).data;
}

// Merge project data with address, config, variants
function mergeData() {
  const projects = readCSV(csvFiles.projects);
  const addresses = readCSV(csvFiles.addresses);
  const configs = readCSV(csvFiles.configs);
  const variants = readCSV(csvFiles.variants);

  return projects.map((proj) => {
    const addr = addresses.find((a) => a.projectId === proj.id) || {};
    const config = configs.find((c) => c.projectId === proj.id) || {};
    const variant = variants.find((v) => v.configurationId === config.id) || {};

    return {
      ...proj,
      cityId: addr.cityId || "",
      localityId: addr.localityId || "",
      customBHK: config.customBHK || "",
      type: config.type || "",
      bathrooms: variant.bathrooms || "",
      balcony: variant.balcony || "",
      furnishedType: variant.furnishedType || "",
      price: variant.price || "",
      amenities: [variant.lift, variant.parkingType, variant.furnishingType].filter(Boolean),
      slug: proj.slug,
    };
  });
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: "Query is required" });

    const filters = parseQuery(query);
    const data = mergeData();

    // Apply filters
    const filtered = data.filter((p) => {
      let ok = true;
      if (filters.city) ok = ok && p.cityId.toLowerCase().includes(filters.city.toLowerCase());
      if (filters.bhk) ok = ok && (p.customBHK === filters.bhk || p.type === filters.bhk);
      if (filters.budget) ok = ok && p.price && parseFloat(p.price) <= filters.budget;
      if (filters.status) ok = ok && p.status.toUpperCase() === filters.status.toUpperCase();
      return ok;
    });

    // Generate short summary
    let summary = "";
    if (filtered.length > 0) {
      const bhkCounts = {};
      filtered.forEach((p) => {
        const bhk = p.customBHK || p.type || "Other";
        bhkCounts[bhk] = (bhkCounts[bhk] || 0) + 1;
      });
      summary = `Found ${filtered.length} properties`;
      if (filters.city) summary += ` in ${filters.city.charAt(0).toUpperCase() + filters.city.slice(1)}`;
      summary += `: `;
      summary += Object.entries(bhkCounts)
        .map(([bhk, count]) => `${count} ${bhk}BHK`)
        .join(", ");
    } else {
      summary = "No properties found matching your criteria.";
    }

    res.status(200).json({ summary, results: filtered });
  } catch (err) {
    console.error("Error in chat API:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
