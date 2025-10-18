import fs from "fs";
import path from "path";
import Papa from "papaparse";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const csvFiles = [
      "Project.csv",
      "ProjectAddress.csv",
      "ProjectConfiguration.csv",
      "ProjectConfigurationVariant.csv",
    ];

    const csvData = {};

    for (const file of csvFiles) {
      const filePath = path.join(process.cwd(), "public", file);

      try {
        const fileContent = fs.readFileSync(filePath, "utf8");
        const results = Papa.parse(fileContent, { header: true }).data;
        csvData[file.replace(".csv", "")] = results;
        console.log(`✅ Loaded ${file}`);
      } catch (err) {
        console.error(`⚠️ Could not read ${file}:`, err.message);
      }
    }

    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: "Query missing in request" });
    }

    // Basic keyword filter example:
    const keyword = query.toLowerCase();
    const projects = csvData.Project || [];
    const addresses = csvData.ProjectAddress || [];
    const configurations = csvData.ProjectConfiguration || [];
    const variants = csvData.ProjectConfigurationVariant || [];

    // Simple search logic
    const matchedProjects = projects.filter(
      (p) =>
        p.projectName?.toLowerCase().includes(keyword) ||
        p.projectType?.toLowerCase().includes(keyword)
    );

    if (matchedProjects.length === 0) {
      return res.status(200).json({
        results: [],
        message: "No properties found matching your criteria.",
      });
    }

    const finalResults = matchedProjects.map((proj) => {
      const address = addresses.find((a) => a.projectId === proj.id);
      const config = configurations.find((c) => c.projectId === proj.id);
      const variant = variants.find((v) => v.configurationId === config?.id);

      return {
        title: proj.projectName,
        type: proj.projectType,
        price: variant?.price || "N/A",
        bhk: config?.customBHK || "N/A",
        city: proj.cityId,
        possession: proj.possessionDate || "N/A",
        address: address?.fullAddress || "N/A",
      };
    });

    return res.status(200).json({ results: finalResults });
  } catch (err) {
    console.error("❌ Server error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}
