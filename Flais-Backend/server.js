const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorMiddleware");
const { sanitizeInput } = require("./middleware/sanitizeInput");
const { createRateLimit } = require("./middleware/rateLimit");

// Connect to MongoDB
connectDB();

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");

// Parse flexible origins from environment variables (e.g. Hostinger domains, comma separated)
const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(url => url.trim())
  : [];

const defaultOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  process.env.VITE_FRONTEND_URL,
  process.env.VITE_ADMIN_URL,
  "https://flais-frontend.vercel.app",
  "http://localhost:5175",
  "http://localhost:5174",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8000",
  "https://metathetical-desiringly-korey.ngrok-free.dev",
].filter(Boolean);

const allowedOrigins = new Set([...defaultOrigins, ...envOrigins]);

// API Security Headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

app.use(
  cors({
    origin(origin, cb) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return cb(null, true);

      // Allow exact matches from the Set
      if (allowedOrigins.has(origin)) return cb(null, true);

      // Allow dynamic Vercel preview domains temporarily
      if (origin.endsWith('.vercel.app')) return cb(null, true);

      console.warn(`CORS blocked for unauthorized origin: ${origin}`);
      // Safely return false instead of throwing an Error (which causes 500s)
      return cb(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(sanitizeInput);

const apiLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: "Too many requests from this IP. Please slow down.",
});

app.use("/api", apiLimiter);

// Serve static files (local storage)
app.use("/media", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/filter-options", require("./routes/filterOptionRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/hero", require("./routes/heroRoutes"));
app.use("/api/series-logos", require("./routes/seriesLogoRoutes"));
app.use("/api/home", require("./routes/homeRoutes"));
app.use("/api/about", require("./routes/aboutRoutes"));
app.use("/api/collection", require("./routes/collectionRoutes"));
app.use("/api/catalog", require("./routes/catalogRoutes"));
app.use("/api/flais-park", require("./routes/flaisParkRoutes"));
app.use("/api/flais-guide", require("./routes/flaisGuideRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));

// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Not found" });
});

// Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
