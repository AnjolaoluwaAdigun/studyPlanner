const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const multer = require("multer"); // Import multer
const authRoutes = require("./routes/authRoutes");
const resourceRoutes = require("./routes/resourceRoutes"); // Import resource routes

dotenv.config();
connectDB();

const app = express();

// Middleware for parsing JSON requests
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/"); // Store the uploaded files in the 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Use timestamp to avoid name collision
  },
});

// Initialize multer with storage configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
}); // Limit file size to 50MB

// Middleware for handling file uploads

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes); // Add resource routes

// Catch-all route for undefined endpoints
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error-handling middleware (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
