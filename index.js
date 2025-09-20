// index.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// .env file load karo
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PORT & Mongo URI from .env
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// ✅ MongoDB Connection
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Simple test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Example Product Route
app.get("/api/products", async (req, res) => {
  try {
    // Example dummy response (until model bana lo)
    res.json([
      { id: 1, name: "Chair", price: 1200 },
      { id: 2, name: "Table", price: 3000 },
    ]);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
