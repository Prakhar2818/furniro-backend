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
})
.catch((err) => {
  console.error("MongoDB connection error:", err);
  console.error('Please check your MONGODB_URI environment variable');
  console.error('Connection string:', MONGODB_URI ? 'Set' : 'Missing');
  
  // Don't exit immediately, allow for connection retry
  console.log('Will attempt to continue without database connection...');
});

// Import routes
import productRoutes from "./routes/furnitureRoutes.js";
import cartRoutes from "./routes/shoppingRoutes.js";

// Apply routes
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

// Add a dedicated brands endpoint for easier access
app.get("/api/brands", async (req, res) => {
  try {
    // Check database connection before query
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }
    
    const Product = (await import('./models/FurnitureItem.js')).default;
    const brands = await Product.distinct('brand').maxTimeMS(15000);
    res.json(brands);
  } catch (err) {
    console.error('Error fetching brands:', err);
    
    if (err.message.includes('buffering timed out') || err.message.includes('timed out')) {
      return res.status(503).json({ 
        error: 'Database query timeout', 
        message: 'Please try again in a moment' 
      });
    }
    
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.json({ 
    message: "Furniro backend is running!", 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
