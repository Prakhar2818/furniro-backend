import Cart from "../models/ShoppingCart.js";

export const getCart = async (req, res) => {
  try {
    console.log('getCart called for ID:', req.params.id);
    
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid cart ID format' });
    }
    
    const cart = await Cart.findById(req.params.id).populate('items.product');
    if (!cart) {
      console.log('Cart not found, creating new cart');
      // Create a new cart if not found
      const newCart = new Cart({ items: [] });
      await newCart.save();
      return res.json(newCart);
    }
    
    console.log('Cart found:', cart._id);
    res.json(cart);
  } catch (err) {
    console.error('Error in getCart:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};

export const createCart = async (req, res) => {
  try {
    const cart = new Cart({ items: req.body.items || [] });
    await cart.save();
    res.status(201).json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const addItemToCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    const { product, quantity } = req.body;
    const existingItem = cart.items.find(item => item.product.toString() === product);
    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      cart.items.push({ product, quantity: quantity || 1 });
    }
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const removeItemFromCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    cart.items = cart.items.filter(item => item.product.toString() !== req.body.product);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateItemQuantity = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    const { product, quantity } = req.body;
    const item = cart.items.find(item => item.product.toString() === product);
    if (item) {
      item.quantity = quantity;
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ error: "Item not found in cart" });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteCart = async (req, res) => {
  try {
    const cart = await Cart.findByIdAndDelete(req.params.id);
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    res.json({ message: "Cart deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
