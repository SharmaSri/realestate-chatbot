import fs from "fs";
import parse from "csv-parse/lib/sync";

export function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const records = parse(content, { columns: true, skip_empty_lines: true });
  return records;
}
