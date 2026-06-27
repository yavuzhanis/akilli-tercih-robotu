const fs = require("node:fs/promises");
const path = require("node:path");

const dbPath = path.join(__dirname, "dev.db");
const backupDir = path.resolve(__dirname, "..", "backups");

function getTimestamp() {
  return new Date()
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z")
    .replace(/[-:]/g, "")
    .replace("T", "-")
    .replace("Z", "");
}

async function main() {
  try {
    await fs.access(dbPath);
  } catch (_error) {
    throw new Error("Yedeklenecek SQLite dosyasi bulunamadi. Once `npm run db:setup` calistirin.");
  }

  await fs.mkdir(backupDir, { recursive: true });

  const backupPath = path.join(backupDir, `dev-${getTimestamp()}.db`);
  await fs.copyFile(dbPath, backupPath);

  console.log(`SQLite yedegi olusturuldu: ${path.relative(process.cwd(), backupPath)}`);
}

main().catch(error => {
  console.error(error.message || error);
  process.exitCode = 1;
});
