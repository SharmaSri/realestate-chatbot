
/**
 * Format raw project data into user-friendly project cards
 * @param {Array} projects - Raw project JSON data
 * @param {Object} cityMap - Mapping of cityId to city names
 * @param {Object} localityMap - Mapping of localityId to locality names
 * @returns {Object} { summary: string, cards: Array }
 */
export function formatProjects(projects, cityMap, localityMap) {
  if (!projects || projects.length === 0) {
    return {
      summary: "No projects found matching your criteria.",
      cards: []
    };
  }

  const cards = projects.map(row => {
    const city = cityMap[row.cityId] || "Unknown city";
    const locality = localityMap[row.localityId] || "Unknown locality";
    const bhk = row.bhk || "-";
    const priceFormatted = row.price
      ? row.price >= 100 ? `₹${(row.price / 100).toFixed(2)} Cr` : `₹${row.price} L`
      : "N/A";
    const status = row.status === "UNDER_CONSTRUCTION" ? "Under Construction" : "Ready-to-move";
    const amenities = row.amenities ? row.amenities.slice(0, 3) : [];

    return {
      title: row.projectName,
      city,
      locality,
      bhk,
      price: priceFormatted,
      possessionStatus: status,
      slug: row.slug,
      amenities
    };
  });

  // Build a short summary
  const total = cards.length;
  const bhkCount = {};
  const cities = new Set();

  cards.forEach(card => {
    cities.add(card.city);
    bhkCount[card.bhk] = (bhkCount[card.bhk] || 0) + 1;
  });

  const bhkSummary = Object.entries(bhkCount)
    .map(([bhk, count]) => `${count} ${bhk}`)
    .join(", ");

  const summary = `Found ${total} projects in ${Array.from(cities).join(", ")} with configurations: ${bhkSummary}.`;

  return { summary, cards };
}
