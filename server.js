const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const placesRoutes = require("./routes/places.route");
const connectDB = require("./db/connection");

const authRoutes = require("./routes/auth.route");
const userRoutes = require("./routes/user.route");
const jobRoutes = require("./routes/jobs.route");
import expenseRoutes from "./routes/expense.route";
// const loadRoutes = require("./routes/loadRoutes");
// const locationRoutes = require("./routes/locationRoutes");
// const postRoutes = require("./routes/postRoutes");
// const documentRoutes = require("./routes/documentRoutes");
// const expenseRoutes = require("./routes/expenseRoutes");
// const assistantRoutes = require("./routes/assistantRoutes");
// const emergencyRoutes = require("./routes/emergencyRoutes");
// const marketplaceRoutes = require("./routes/marketplaceRoutes");

const errorMiddleware = require("./middleware/middleware");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Trucker Backend API Running Successfully 🚛",
  });
});


app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/jobs", jobRoutes);

app.use("/api/places", placesRoutes);

app.use("/api/expensetracker", expenseRoutes);

// app.use("/api/loads", loadRoutes);

// app.use("/api/locations", locationRoutes);

// app.use("/api/posts", postRoutes);

// app.use("/api/documents", documentRoutes);

// app.use("/api/expenses", expenseRoutes);

// app.use("/api/assistant", assistantRoutes);

// app.use("/api/emergency", emergencyRoutes);

// app.use("/api/marketplace", marketplaceRoutes);

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorMiddleware);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
