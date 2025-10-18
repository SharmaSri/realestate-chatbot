// Optional: Extract BHK, city, budget, etc. from user query
export function parseQuery(message) {
  const lower = message.toLowerCase();
  const bhkMatch = lower.match(/\b(\d+)bhk\b/);
  const cityMatch = lower.match(/\b(in|at)\s(\w+)\b/);

  return {
    bhk: bhkMatch ? bhkMatch[1] : null,
    city: cityMatch ? cityMatch[2] : null,
  };
}
