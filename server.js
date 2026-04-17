require("dotenv").config();
const express = require("express");
const cors = require("cors");
const getProfileRoute = require("./routes/profile.routes");
const connectDB = require("./database/db");

const app = express();

connectDB();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api", getProfileRoute);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Stage-1 External API Backend server is running fine",
    data: {
      time: new Date().toISOString()
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found"
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || err.statusCode || 500;
  const message =
    statusCode >= 500 ? "Internal server error" : err.message || "Request failed";

  res.status(statusCode).json({
    status: "error",
    message
  });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Stage-1 Server running on port ${PORT}`);
  });
}

module.exports = app;
