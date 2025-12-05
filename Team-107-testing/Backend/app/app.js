const { startMongoDB } = require("./startMongo");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

startMongoDB();

// Connect Mongoose (wait a bit to let mongod start)
const MONGO_URI = "mongodb://127.0.0.1:27017/database";

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`🚀 Launched on http://localhost:${port}`);
      console.log(`📝 API Docs at http://localhost:${port}/api-docs`);
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};

// Init app
const app = express();
const port = 3000;
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "DELETE", "POST"],
  })
);
app.use(express.json());

// Import routes
const authRoutes = require("./routes/auth");
const clientRoutes = require("./routes/clients");
const coordinatorRoutes = require("./routes/coordinators");

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "AnchorPoint API",
      version: "1.0.0",
      description: "API for the AnchorPoint application.",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [path.join(__dirname, "routes/*.js")], // absolute path based on this file
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Use routes
app.use(authRoutes);
app.use(clientRoutes);
app.use(coordinatorRoutes);

connectDB();