import mongoose from "mongoose";

export const cleanupSeededData = async (batch = null) => {
  try {
    const collections = Object.values(mongoose.connection.collections);

    for (let col of collections) {
      if (batch) {
        await col.deleteMany({ seedBatch: batch });
      } else {
        await col.deleteMany({ seedBatch: { $exists: true } });
      }
    }

    console.log("🧹 Cleanup complete");
  } catch (err) {
    console.error("❌ Cleanup failed:", err);
  }
};