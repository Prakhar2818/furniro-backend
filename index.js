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

// Set mongoose options to prevent buffering issues
mongoose.set('bufferCommands', false);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 60000, // Increase to 60 seconds
  socketTimeoutMS: 60000, // Increase to 60 seconds
  connectTimeoutMS: 60000, // Add connection timeout
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 5, // Maintain at least 5 socket connections
})
.then(() => {
  console.log("MongoDB connected successfully");
  console.log('Database:', MONGODB_URI ? 'Connected to MongoDB Atlas' : 'No MongoDB URI found');
  
  // Test the connection with a simple operation
  mongoose.connection.db.admin().ping((err, result) => {
    if (err) {
      console.error('MongoDB ping failed:', err);
    } else {
      console.log('MongoDB ping successful:', result);
    }
  });
  
  // Additional connection verification
  setTimeout(async () => {
    try {
      const Product = (await import('./models/FurnitureItem.js')).default;
      const count = await Product.countDocuments().maxTimeMS(10000);
      console.log(`Database verification: Found ${count} products`);
    } catch (verifyError) {
      console.error('Database verification failed:', verifyError.message);
    }
  }, 2000);
})
.catch((err) => {
  console.error("MongoDB connection error:", err);
  console.error('Please check your MONGODB_URI environment variable');
  console.error('Connection string:', MONGODB_URI ? 'Set' : 'Missing');
  
  // Don't exit immediately, allow for connection retry
  console.log('Will attempt to continue without database connection...');
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

// Health check endpoint with enhanced diagnostics
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
    
    let productCount = 'unknown';
    let connectionTest = 'failed';
    
    // Only try to query if connected
    if (dbState === 1) {
      try {
        // Import Product model to check collections
        const Product = (await import('./models/FurnitureItem.js')).default;
        
        // Quick test with timeout
        productCount = await Product.countDocuments().maxTimeMS(5000);
        connectionTest = 'success';
      } catch (queryError) {
        console.error('Health check query error:', queryError.message);
        connectionTest = queryError.message;
      }
    }
    
    const healthStatus = {
      status: dbState === 1 ? 'ok' : 'warning',
      database: dbStatus[dbState] || 'unknown',
      productCount: productCount,
      connectionTest: connectionTest,
      timestamp: new Date().toISOString(),
      mongooseVersion: mongoose.version,
      uptime: process.uptime()
    };
    
    // Return 503 if database is not connected
    const statusCode = dbState === 1 ? 200 : 503;
    res.status(statusCode).json(healthStatus);
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Manual seed endpoint for debugging with enhanced error handling
app.post("/seed", async (req, res) => {
  try {
    console.log('Seed endpoint called - checking database connection...');
    
    // Check connection first
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: 'Database not connected',
        readyState: mongoose.connection.readyState,
        message: 'Cannot seed database - connection unavailable'
      });
    }
    
    const Product = (await import('./models/FurnitureItem.js')).default;
    
    console.log('Clearing existing products...');
    const deleteResult = await Product.deleteMany({}).maxTimeMS(30000);
    console.log('Deleted products:', deleteResult.deletedCount);
    
    // Create sample data
    const productNames = [
      "Velvet Sectional", "Marble Coffee Table", "Ergonomic Desk Chair", "Platform Bed", "Glass Display Cabinet",
      "Round Dining Table", "Entertainment Center", "Leather Recliner", "Windsor Chair", "Walk-in Closet"
    ];
    
    const brands = ["Luxora", "Modernique", "Craftwood", "Elegance Home", "ComfortZone"];
    
    const sampleProducts = Array.from({ length: 20 }, (_, i) => ({
      name: `${productNames[i % productNames.length]} Model-${i + 1}`,
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      price: parseFloat((Math.random() * 1000 + 100).toFixed(2)),
      image: `https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop`,
      brand: brands[i % brands.length],
      stock: Math.floor(Math.random() * 50) + 5,
    }));
    
    console.log('Inserting new products...');
    const insertResult = await Product.insertMany(sampleProducts, { 
      timeout: 30000,
      maxTimeMS: 30000 
    });
    
    console.log('Seeding completed successfully');
    
    res.json({ 
      message: 'Database seeded successfully', 
      productsAdded: insertResult.length,
      deletedCount: deleteResult.deletedCount
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({
      error: error.message,
      message: 'Failed to seed database',
      type: error.name
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
