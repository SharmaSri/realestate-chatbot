// pages/api/chat.js
import fs from "fs";
import path from "path";
import Papa from "papaparse";

export default async function handler(req, res) {
  try {
    // --- Helper function to load CSV safely ---
    const loadCSV = (filename) => {
      const filePath = path.join(process.cwd(), "public", filename);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ Could not read ${filename}: File does not exist at ${filePath}`);
        return [];
      }
      const csvData = fs.readFileSync(filePath, "utf8");
      return Papa.parse(csvData, { header: true, skipEmptyLines: true }).data;
    };

    // --- Load all CSVs ---
    const projects = loadCSV("Project.csv");
    const addresses = loadCSV("ProjectAddress.csv");
    const configurations = loadCSV("ProjectConfiguration.csv");
    const variants = loadCSV("ProjectConfigurationVariant.csv");

    console.log(`✅ Loaded ${projects.length} projects`);
    console.log(`✅ Loaded ${addresses.length} addresses`);
    console.log(`✅ Loaded ${configurations.length} configurations`);
    console.log(`✅ Loaded ${variants.length} variants`);

    // --- Parse user query (dummy for now) ---
    const { query } = req.body || {};
    if (!query) {
      return res.status(400).json({ message: "Query is required." });
    }

    // Example filter: 2BHK ready homes in Pune under 1.5 Cr
    const filteredProjects = projects.filter(
      (p) =>
        p.cityId === "cmf6nu3ru000gvcxspxarll3v" && // Pune ID
        p.status === "READY" &&
        configurations.some(
          (c) =>
            c.projectId === p.id &&
            c.customBHK === "2BHK" &&
            variants.some((v) => v.configurationId === c.id && Number(v.price) <= 1.5)
        )
    );

    if (filteredProjects.length === 0) {
      return res.json({ summary: "No properties found matching your criteria.", results: [] });
    }

    // Map projects to frontend cards
    const results = filteredProjects.map((p) => {
      const addr = addresses.find((a) => a.projectId === p.id);
      const config = configurations.find((c) => c.projectId === p.id);
      const variant = variants.find((v) => v.configurationId === config?.id);

      return {
        title: p.projectName,
        city: p.cityId, // replace with proper city name mapping
        locality: addr?.fullAddress || "",
        bhk: config?.customBHK || "",
        price: variant?.price ? `₹${variant.price} Cr` : "",
        possession: p.status,
        amenities: ["Lift", "Parking"], // Example, replace with real if in CSV
        slug: p.slug,
      };
    });

    // Example summary
    const summary = `Found ${results.length} matching properties.`;

    return res.status(200).json({ summary, results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
}
