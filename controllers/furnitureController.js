import Product from "../models/FurnitureItem.js";
import mongoose from "mongoose";

export const getAllProducts = async (req, res) => {
  try {
    console.log('getAllProducts called with query:', req.query);
    
    // Check database connection state before proceeding
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected. ReadyState:', mongoose.connection.readyState);
      return res.status(503).json({ 
        error: 'Database connection unavailable', 
        readyState: mongoose.connection.readyState,
        message: 'Please try again in a moment' 
      });
    }
    
    const {
      page = 1,
      limit = 12,
      sortBy = 'name',
      sortOrder = 'asc',
      brand,
      category,
      minPrice,
      maxPrice,
      search
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('Filter applied:', filter);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Set a custom timeout and use lean() for better performance
    const timeoutMs = 15000; // 15 seconds
    
    console.log('Executing product query...');
    
    // Execute query with timeout and lean for better performance
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean() // Returns plain JavaScript objects instead of Mongoose documents
      .maxTimeMS(timeoutMs);
      
    console.log('Product query completed, getting count...');
    
    // Get total count for pagination with timeout
    const total = await Product.countDocuments(filter)
      .maxTimeMS(timeoutMs);
    
    console.log(`Found ${products.length} products, total: ${total}`);
    
    res.json({
      products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)) || 1,
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (err) {
    console.error('Error in getAllProducts:', err);
    
    // Handle specific timeout errors
    if (err.message.includes('buffering timed out') || err.message.includes('timed out')) {
      return res.status(503).json({ 
        error: 'Database query timeout', 
        message: 'The database is taking too long to respond. Please try again in a moment.',
        type: 'timeout'
      });
    }
    
    // Handle connection errors
    if (err.message.includes('connection') || err.message.includes('network')) {
      return res.status(503).json({ 
        error: 'Database connection error', 
        message: 'Unable to connect to database. Please try again later.',
        type: 'connection'
      });
    }
    
    res.status(500).json({ error: err.message, type: 'general' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all unique brands
export const getBrands = async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get product statistics
export const getProductStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          brands: { $addToSet: '$brand' }
        }
      }
    ]);
    res.json(stats[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
