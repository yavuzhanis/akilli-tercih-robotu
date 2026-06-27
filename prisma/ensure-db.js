const fs = require("node:fs/promises");
const path = require("node:path");

const dbPath = path.join(__dirname, "dev.db");

async function main() {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  const handle = await fs.open(dbPath, "a");
  await handle.close();
  console.log(`SQLite dosyasi hazir: ${path.relative(process.cwd(), dbPath)}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
