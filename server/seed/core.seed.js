import { Position } from "../models/position.model.js";

export const seedPositions = async (org, departments, batch) => {
  try {
    const existing = await Position.find({ organizationID: org._id });

    if (existing.length > 0) {
      console.log("ℹ️ Positions already exist, skipping...");
      return existing;
    }

    const engineeringDept = departments.find(d => d.name === "Engineering");
    const hrDept = departments.find(d => d.name === "Human resources");

    const ceo = await Position.create({
      title: "CEO",
      level: 1,
      organizationID: org._id,
      seedBatch: batch
    });

    const engManager = await Position.create({
      title: "Engineering Manager",
      level: 2,
      reportsTo: ceo._id,
      department: engineeringDept?._id || null,
      organizationID: org._id,
      seedBatch: batch
    });

    const hrManager = await Position.create({
      title: "HR Manager",
      level: 2,
      reportsTo: ceo._id,
      department: hrDept?._id || null,
      organizationID: org._id,
      seedBatch: batch
    });

    console.log("✅ Positions created");

    return [ceo, engManager, hrManager];

  } catch (err) {
    console.error("❌ Error seeding positions:", err);
    throw err;
  }
};