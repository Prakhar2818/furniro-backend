import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/FurnitureItem.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const productNames = [
  "Velvet Sectional", "Marble Coffee Table", "Ergonomic Desk Chair", "Platform Bed", "Glass Display Cabinet",
  "Round Dining Table", "Entertainment Center", "Leather Recliner", "Windsor Chair", "Walk-in Closet",
  "Floating Nightstand", "Standing Desk", "Corner Bookshelf", "Wingback Chair", "Modular Sofa",
  "Counter Stool", "Hallway Console", "Storage Bench", "Vintage Dresser", "Nesting Tables",
  "Folding Chair", "Picnic Table", "Glider Chair", "Sleeper Sofa", "Storage Ottoman",
  "Entryway Organizer", "Floor Mirror", "Media Cabinet", "Breakfast Bar", "Wine Rack",
  "Swivel Armchair", "Daybed Lounger", "Pedestal Table", "China Hutch", "Sideboard",
  "L-Shaped Couch", "Racing Chair", "Drafting Chair", "Office Storage", "Toy Chest",
  "Canopy Bed", "Loft Bed", "Murphy Bed", "Breakfast Nook", "Wall Shelf",
  "Ladder Shelf", "Folding Screen", "Newspaper Stand", "Flower Stand", "Hamper Basket"
];

const brands = [
  "Luxora", "Modernique", "Craftwood", "Elegance Home", "ComfortZone",
  "UrbanLiving", "CozyCorner", "StyleCraft", "HomeHaven", "DecorPro",
  "FurnitureForte", "DesignDen", "LivingSpace", "HomeComfort", "InteriorInk"
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Furniture placeholder images from Unsplash
const furnitureImages = [
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop", // Modern sofa
  "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop", // Dining table
  "https://images.unsplash.com/photo-1549497538-303791108f95?w=400&h=300&fit=crop", // Office chair
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop", // Bedroom
  "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=300&fit=crop", // Bookshelf
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop", // Coffee table
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop", // Living room
  "https://images.unsplash.com/photo-1493663284031-b7e3aab21924?w=400&h=300&fit=crop", // Armchair
  "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop", // Desk
  "https://images.unsplash.com/photo-1549497538-303791108f95?w=400&h=300&fit=crop", // Kitchen furniture
  "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=300&fit=crop", // Storage
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop", // Sectional
  "https://images.unsplash.com/photo-1493663284031-b7e3aab21924?w=400&h=300&fit=crop", // Ottoman
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop", // Side table
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop", // Wardrobe
  "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop", // Bar furniture
  "https://images.unsplash.com/photo-1549497538-303791108f95?w=400&h=300&fit=crop", // Console
  "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=300&fit=crop", // Bench
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop", // Nightstand
  "https://images.unsplash.com/photo-1493663284031-b7e3aab21924?w=400&h=300&fit=crop"  // Chest
];

const sampleProducts = Array.from({ length: 50 }, (_, i) => {
  const name = productNames[i % productNames.length];
  const imageIndex = i % furnitureImages.length;
  const brandIndex = i % brands.length;
  const descriptions = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.",
    "Ut labore et dolore magna aliqua. Enim ad minim veniam, quis nostrud exercitation.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.",
    "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis.",
    "Et harum quidem rerum facilis est et expedita distinctio nam libero tempore.",
    "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus.",
    "Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis.",
    "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil."
  ];
  return {
    name: `${name} Model-${String.fromCharCode(65 + (i % 26))}${getRandomInt(100, 999)}`,
    description: descriptions[i % descriptions.length],
    price: parseFloat((getRandomInt(99, 2499) + Math.random()).toFixed(2)),
    image: furnitureImages[imageIndex],
    brand: brands[brandIndex],
    stock: getRandomInt(5, 50),
  };
});

async function seedProducts() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await Product.deleteMany();
    await Product.insertMany(sampleProducts);
    console.log("Sample products seeded successfully.");
    mongoose.disconnect();
  } catch (err) {
    console.error("Seeding error:", err);
    mongoose.disconnect();
  }
}

seedProducts();
