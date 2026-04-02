import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB connected");
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  }
};