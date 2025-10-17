// pages/api/chat.js
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const dataPath = path.join(process.cwd(), 'public');

let projects = [];
let addresses = [];
let configurations = [];
let variants = [];

// Helper to load CSV once
const loadCSV = (file) =>
  new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(path.join(dataPath, file))
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });

const loadAllData = async () => {
  if (projects.length) return; // already loaded
  projects = await loadCSV('project.csv');
  addresses = await loadCSV('ProjectAddress.csv');
  configurations = await loadCSV('ProjectConfiguration.csv');
  variants = await loadCSV('ProjectConfigurationVariant.csv');
};

export default async function handler(req, res) {
  await loadAllData();

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  const query = message.toLowerCase();

  // Filter projects by projectName or city/locality
  const matchedProjects = projects.filter((proj) => {
    const addr = addresses.find((a) => a.projectId === proj.id) || {};
    return (
      (proj.projectName && proj.projectName.toLowerCase().includes(query)) ||
      (addr.fullAddress && addr.fullAddress.toLowerCase().includes(query))
    );
  });

  if (!matchedProjects.length)
    return res.json({ reply: 'No matching properties found. Try another city or project name.' });

  // Build response with configurations & variants
  const results = matchedProjects.map((proj) => {
    const addr = addresses.find((a) => a.projectId === proj.id) || {};
    const configs = configurations.filter((c) => c.projectId === proj.id);
    const configDetails = configs.map((c) => {
      const variant = variants.find((v) => v.configurationId === c.id) || {};
      return {
        type: c.customBHK || c.type,
        price: variant.price,
        carpetArea: variant.carpetArea,
        possessionDate: proj.possessionDate,
        fullAddress: addr.fullAddress,
        images: variant.propertyImages ? JSON.parse(variant.propertyImages) : [],
      };
    });

    return {
      projectName: proj.projectName,
      status: proj.status,
      summary: proj.projectSummary,
      address: addr.fullAddress,
      configs: configDetails,
    };
  });

  // Example response
  const reply = results
    .map((p) => {
      return `🏠 ${p.projectName} (${p.status})
Address: ${p.address}
Available Configurations:
${p.configs
  .map((c) => `- ${c.type}, ₹${c.price}, ${c.carpetArea} sq.ft`)
  .join('\n')}`;
    })
    .join('\n\n');

  res.json({ reply });
}
