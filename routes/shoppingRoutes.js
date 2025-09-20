import express from "express";
import {
  getCart,
  createCart,
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  deleteCart,
} from "../controllers/shoppingController.js";

const router = express.Router();

router.get("/:id", getCart);
router.post("/", createCart);
router.post("/:id/items", addItemToCart);
router.put("/:id/items", updateItemQuantity);
router.delete("/:id/items", removeItemFromCart);
router.delete("/:id", deleteCart);

export default router;
