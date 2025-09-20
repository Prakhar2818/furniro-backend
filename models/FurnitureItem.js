import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  brand: { type: String, required: true },
  stock: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
