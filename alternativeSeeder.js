import dotenv from "dotenv";
import db from "mongoose";
import Product from "./models/FurnitureItem.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const productNames = [
  "Modern Sofa", "Wooden Dining Table", "Office Chair", "Bed Frame", "Bookshelf",
  "Coffee Table", "TV Stand", "Recliner", "Dining Chair", "Wardrobe",
  "Nightstand", "Desk", "Bookcase", "Armchair", "Loveseat",
  "Bar Stool", "Console Table", "Bench", "Chest of Drawers", "Side Table",
  "Patio Chair", "Outdoor Table", "Rocking Chair", "Futon", "Ottoman",
  "Shoe Rack", "Mirror", "Cabinet", "Kitchen Island", "Pantry Shelf",
  "Accent Chair", "Chaise Lounge", "End Table", "Hutch", "Buffet Table",
  "Sectional Sofa", "Gaming Chair", "Swivel Chair", "Filing Cabinet", "Storage Box",
  "Kids Bed", "Bunk Bed", "Trundle Bed", "Dining Bench", "Corner Shelf",
  "Floating Shelf", "Room Divider", "Magazine Rack", "Plant Stand", "Laundry Basket"
];

const brands = [
  "IKEA", "Ashley", "Wayfair", "West Elm", "Pottery Barn",
  "Crate & Barrel", "CB2", "Room & Board", "Article", "Floyd",
  "Herman Miller", "Steelcase", "Knoll", "Humanscale", "Haworth"
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Working furniture images from Pexels
const furnitureImages = [
  "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop", // Sofa
  "https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop", // Dining setup
  "https://images.pexels.com/photos/586769/pexels-photo-586769.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop", // Chair
  "https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop", // Bedroom
  "https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop", // Table
  "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop", // Living room
  "https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop", // Modern furniture
  "https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop", // Office
  "https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop", // Desk
  "https://images.pexels.com/photos/775219/pexels-photo-775219.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop", // Kitchen
  "https://images.pexels.com/photos/6969831/pexels-photo-6969831.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop", // Bookshelf
  "https://images.pexels.com/photos/2631613/pexels-photo-2631613.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop", // Armchair
  "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop", // Ottoman
  "https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop", // Side table
  "https://images.pexels.com/photos/1444424/pexels-photo-1444424.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop", // Wardrobe
  "https://images.pexels.com/photos/2029731/pexels-photo-2029731.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop", // Bar stool
  "https://images.pexels.com/photos/1374125/pexels-photo-1374125.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop", // Console
  "https://images.pexels.com/photos/2079246/pexels-photo-2079246.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop", // Bench
  "https://images.pexels.com/photos/1124062/pexels-photo-1124062.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop", // Nightstand
  "https://images.pexels.com/photos/2092058/pexels-photo-2092058.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop", // Chest
];

const sampleProducts = Array.from({ length: 50 }, (_, i) => {
  const name = productNames[i % productNames.length];
  const imageIndex = i % furnitureImages.length;
  const brandIndex = i % brands.length;
  return {
    name: `${name} ${i + 1}`,
    description: `High quality ${name.toLowerCase()} for your home or office.`,
    price: parseFloat((getRandomInt(50, 1000) + Math.random()).toFixed(2)),
    image: furnitureImages[imageIndex],
    brand: brands[brandIndex],
    stock: getRandomInt(1, 30),
  };
});

async function seedProducts() {
  try {
    await db.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await Product.deleteMany();
    await Product.insertMany(sampleProducts);
    console.log("Sample products seeded successfully.");
    db.disconnect();
  } catch (err) {
    console.error("Seeding error:", err);
    db.disconnect();
  }
}

seedProducts();