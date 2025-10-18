import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { parseQueryWithLLM } from "../../utils/queryParser.js";

const csvFiles = [
  "Project.csv",
  "ProjectAddress.csv",
  "ProjectConfiguration.csv",
  "ProjectConfigurationVariant.csv"
];

const csvData = {};

for (const file of csvFiles) {
  const filePath = path.join(process.cwd(), "public", file);
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const results = Papa.parse(fileContent, { header: true }).data;
    csvData[file.replace(".csv", "")] = results;
    console.log(`✅ Loaded ${file}, sample:`, results[0]);
  } catch (err) {
    console.error(`❌ Error reading ${file}:`, err.message);
  }
}


    // Extract filters
    const q = query.toLowerCase();
    const bhkMatch = q.match(/(\d+)\s*bhk/i);
    const priceMatch = q.match(/under\s*₹?\s*([\d.]+)\s*([lc]r)?/i);
    const cityMatch = q.match(/in\s+([a-zA-Z]+)/i);

    const bhk = bhkMatch ? parseInt(bhkMatch[1]) : null;
    let maxPrice = null;
    if (priceMatch) {
      const value = parseFloat(priceMatch[1]);
      const unit = priceMatch[2];
      if (unit === "cr") maxPrice = value * 10000000;
      else if (unit === "l") maxPrice = value * 100000;
      else maxPrice = value;
    }
    const city = cityMatch ? cityMatch[1].toLowerCase() : null;

    // Merge data
    const merged = variants.map((v) => {
      const config = configs.find((c) => c.id === v.configurationId);
      const project = projects.find((p) => p.id === config?.projectId);
      const address = addresses.find((a) => a.projectId === project?.id);

      return {
        projectName: project?.projectName,
        cityId: project?.cityId,
        customBHK: config?.customBHK,
        price: v.price,
        possessionDate: project?.possessionDate,
        status: project?.status,
        projectType: project?.projectType,
        propertyCategory: config?.propertyCategory,
        fullAddress: address?.fullAddress,
      };
    });

    // Filter logic
    const filtered = merged.filter((item) => {
      const priceOk =
        !maxPrice || (item.price && parseFloat(item.price) <= maxPrice);
      const bhkOk =
        !bhk ||
        (item.customBHK &&
          parseInt(item.customBHK) === bhk);
      const cityOk =
        !city ||
        (item.fullAddress && item.fullAddress.toLowerCase().includes(city));

      return priceOk && bhkOk && cityOk;
    });

    if (!filtered.length)
      return res.status(200).json({
        summary: "No properties found matching your criteria.",
        results: [],
      });

    res.status(200).json({
      summary: `Found ${filtered.length} matching properties.`,
      results: filtered.slice(0, 10),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
}
