import fs from "fs";
import path from "path";
import Papa from "papaparse";

const parseCSV = (filePath) =>
  new Promise((resolve, reject) => {
    const csvFile = fs.readFileSync(filePath, "utf8");
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    });
  });

const extractNumber = (text) => {
  if (!text) return 0;
  const match = text.replace(/,/g, "").match(/\d+/);
  return match ? parseInt(match[0]) : 0;
};

const extractBHK = (text) => {
  const match = text.match(/(\d)\s*BHK/i);
  return match ? parseInt(match[1]) : null;
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Query required" });

  // Load CSV files
  const projectData = await parseCSV(path.join(process.cwd(), "public", "project.csv"));
  const addressData = await parseCSV(path.join(process.cwd(), "public", "ProjectAddress.csv"));
  const configData = await parseCSV(path.join(process.cwd(), "public", "ProjectConfiguration.csv"));
  const variantData = await parseCSV(path.join(process.cwd(), "public", "ProjectConfigurationVariant.csv"));

  // Extract filters from query
  const budget = extractNumber(query); // ₹1.2 Cr -> 12000000
  const bhk = extractBHK(query);       // 3BHK -> 3
  const cityMatch = query.match(/Pune|Mumbai|Bangalore|Delhi/i);
  const city = cityMatch ? cityMatch[0] : null;

  // Merge data
  const results = projectData.map((project) => {
    const address = addressData.find((a) => a.projectId === project.id);
    const configs = configData.filter((c) => c.projectId === project.id);
    const variants = variantData.filter((v) =>
      configs.some((c) => c.id === v.configurationId)
    );

    const minPrice = Math.min(...variants.map((v) => parseFloat(v.price || Infinity)));

    return {
      id: project.id,
      name: project.projectName,
      status: project.status,
      city: address?.fullAddress || "",
      bhk: configs.map((c) => c.type).join(", "),
      price: minPrice,
      possessionDate: project.possessionDate || "",
      variants,
    };
  });

  // Filter based on query
  let filtered = results;
  if (city) filtered = filtered.filter((r) => r.city.toLowerCase().includes(city.toLowerCase()));
  if (bhk) filtered = filtered.filter((r) => r.bhk.includes(`${bhk}BHK`));
  if (budget) filtered = filtered.filter((r) => r.price <= budget);

  // Return top 5 results
  res.status(200).json({ results: filtered.slice(0, 5) });
}
