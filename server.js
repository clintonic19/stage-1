require("dotenv").config();
const express = require("express");
const cors = require("cors");
const getProfileRoute = require("./routes/profile.routes");
const connectDB = require("./database/db");

const app = express();

// Connect to MongoDB
connectDB();

// Enable CORS (required)
app.use(cors({ origin: "*" }));
app.use(express.json());

//main routes
app.use("/api", getProfileRoute);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Stage-1 External API Backend server is running fine 🚀',
    time: new Date().toISOString(),
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Stage-1 Server running on port ${PORT}`);
});

// Export the app for testing
// module.exports = app; 
