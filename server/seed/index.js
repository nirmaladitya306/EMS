import { connectDB } from "./db.js";
import { SEED_BATCH, CONFIG } from "./constants.js";
import { loadBase } from "./loaders.js";
import { seedPositions } from "./core.seed.js";
import { enrichEmployees, createExtraEmployees } from "./users.seed.js";
import { seedAttendance, seedSalary, seedLeaves } from "./modules.seed.js";
import { cleanupSeededData } from "./cleanup.js";

const run = async () => {
  try {
    console.log("🚀 Seeder started...");

    const mode = process.argv[2]; // seed | clean

    await connectDB();
    console.log("✅ DB connected");

    // CLEAN MODE
    if (mode === "clean") {
      console.log("🧹 Cleaning seeded data...");
      await cleanupSeededData();
      console.log("✅ Cleanup complete");
      process.exit(0);
    }

    // LOAD BASE DATA
    console.log("📦 Loading base data...");
    const { org, hr, employees, departments } = await loadBase();

    if (!org) throw new Error("Organization not found");

    console.log("🏢 Org:", org.name);
    console.log("👨‍💼 HR:", hr?.email);
    console.log("👥 Employees found:", employees.length);
    console.log("🏬 Departments found:", departments.length);

    // CORE SEEDING
    const positions = await seedPositions(org, departments, SEED_BATCH);
    console.log("✅ Positions seeded");

    await enrichEmployees(employees, positions, departments, org, SEED_BATCH);
    console.log("✅ Employees enriched");

    // EXTRA EMPLOYEES
    const extraEmployees = await createExtraEmployees(
      org,
      departments,
      SEED_BATCH,
      CONFIG.EXTRA_EMPLOYEES
    );

    console.log("✅ Extra employees created:", extraEmployees.length);

    const allEmployees = [...employees, ...extraEmployees];

    // MODULE SEEDING
    await seedAttendance(allEmployees, org, SEED_BATCH);
    console.log("✅ Attendance seeded");

    await seedSalary(allEmployees, org, SEED_BATCH);
    console.log("✅ Salary seeded");

    await seedLeaves(allEmployees, org, SEED_BATCH);
    console.log("✅ Leaves seeded");

    console.log("🎉 Seeding complete");
    process.exit(0);

  } catch (err) {
    console.error("❌ Seeder failed:", err);
    process.exit(1);
  }
};

run();