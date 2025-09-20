import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

console.log("Mongoose imported successfully");
console.log("MongoDB URI:", process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    mongoose.connection.close();
  })
  .catch(err => {
    console.error("Failed to connect:", err);
  });