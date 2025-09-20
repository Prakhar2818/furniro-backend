import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// Enhanced CORS configuration for frontend
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true
}));

app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set!');
  process.exit(1);
}

console.log('Connecting to MongoDB...', MONGODB_URI.includes('mongodb') ? 'URI looks valid' : 'Invalid URI format');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 45000, // 45 seconds  
  bufferMaxEntries: 0, // Disable mongoose buffering
  bufferCommands: false, // Disable mongoose buffering
})
.then(() => {
  console.log("MongoDB connected successfully");
  console.log('Database:', MONGODB_URI ? 'Connected to MongoDB Atlas' : 'No MongoDB URI found');
  
  // Test the connection
  mongoose.connection.db.admin().ping((err, result) => {
    if (err) {
      console.error('MongoDB ping failed:', err);
    } else {
      console.log('MongoDB ping successful:', result);
    }
  });
})
.catch((err) => {
  console.error("MongoDB connection error:", err);
  console.error('Please check your MONGODB_URI environment variable');
  console.error('Connection string:', MONGODB_URI ? 'Set' : 'Missing');
  
  // Exit process if database connection fails
  setTimeout(() => {
    console.error('Exiting due to database connection failure');
    process.exit(1);
  }, 5000);
});

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Handle application termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
  process.exit(0);
});

import productRoutes from "./routes/furnitureRoutes.js";

import cartRoutes from "./routes/shoppingRoutes.js";
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

app.get("/", (req, res) => {
  res.json({ 
    message: "Furniro backend is running!", 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
      0: 'disconnected',
      1: 'connected', 
      2: 'connecting',
      3: 'disconnecting'
    };
    
    // Import Product model to check collections
    const Product = (await import('./models/FurnitureItem.js')).default;
    const productCount = await Product.countDocuments();
    
    res.json({
      status: 'ok',
      database: dbStatus[dbState] || 'unknown',
      productCount: productCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Manual seed endpoint for debugging
app.post("/seed", async (req, res) => {
  try {
    const Product = (await import('./models/FurnitureItem.js')).default;
    
    // Import sample data from seeder
    const module = await import('./dataSeeder.js');
    // We'll recreate the sample data here since we simplified the seeder
    
    const productNames = [
      "Velvet Sectional", "Marble Coffee Table", "Ergonomic Desk Chair", "Platform Bed", "Glass Display Cabinet"
    ];
    
    const brands = ["Luxora", "Modernique", "Craftwood", "Elegance Home", "ComfortZone"];
    
    const sampleProducts = Array.from({ length: 10 }, (_, i) => ({
      name: `${productNames[i % productNames.length]} Model-${i + 1}`,
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      price: parseFloat((Math.random() * 1000 + 100).toFixed(2)),
      image: `https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop`,
      brand: brands[i % brands.length],
      stock: Math.floor(Math.random() * 50) + 5,
    }));
    
    await Product.deleteMany();
    await Product.insertMany(sampleProducts);
    
    res.json({ 
      message: 'Database seeded successfully', 
      productsAdded: sampleProducts.length 
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: 'Failed to seed database'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
