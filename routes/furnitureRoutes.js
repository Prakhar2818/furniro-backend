import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands,
  getProductStats,
} from "../controllers/furnitureController.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/brands", getBrands);
router.get("/stats", getProductStats);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
