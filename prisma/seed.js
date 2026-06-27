const fs = require("node:fs/promises");
const path = require("node:path");
const vm = require("node:vm");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const ROOT_DIR = path.resolve(__dirname, "..");
const PROGRAM_DATA_FILE = path.join(ROOT_DIR, "assets", "js", "program-data.js");

async function loadProgramData() {
  const source = await fs.readFile(PROGRAM_DATA_FILE, "utf8");
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename: PROGRAM_DATA_FILE });

  return Array.isArray(context.window.PROGRAM_DATA)
    ? context.window.PROGRAM_DATA
    : [];
}

function toProgramRecord(program) {
  return {
    id: program.id,
    university: program.university || "Kapadokya Üniversitesi",
    name: program.name,
    faculty: program.faculty,
    scoreType: program.scoreType,
    educationType: program.educationType,
    campus: program.campus,
    city: program.city || "Nevsehir",
    duration: program.duration,
    language: program.language,
    scholarshipOptions: JSON.stringify(program.scholarshipOptions || []),
    quota: Number(program.quota || 0),
    careers: JSON.stringify(program.careers || []),
    baseScore: Number(program.baseScore || 0),
    rank: program.rank,
    sourceYear: program.sourceYear,
    sourceStatus: program.sourceStatus,
    category: program.category,
    priorities: JSON.stringify(program.priorities || []),
    summary: program.summary,
    feeStatus: program.feeStatus || null,
    baseScoreYear: program.baseScoreYear || null,
    rankYear: program.rankYear || null,
    quotaYear: program.quotaYear || null,
    isActive: true
  };
}

async function main() {
  const programs = await loadProgramData();
  const activeProgramIds = programs.map(program => program.id);

  for (const program of programs) {
    const data = toProgramRecord(program);
    const { isActive, ...updateData } = data;
    await prisma.program.upsert({
      where: { id: data.id },
      create: data,
      update: updateData
    });
  }

  const inactiveResult = await prisma.program.deleteMany({
    where: {
      id: { notIn: activeProgramIds },
      choices: { none: {} }
    }
  });

  console.log(`${programs.length} program veritabanina yazildi. ${inactiveResult.count} eski/demo program silindi.`);
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
