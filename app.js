const express = require("express");
const http = require("http");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require('cors');

// Import routes
const authServiceRoutes = require("./authservice/index");
const setup = require("./setup/index");
const urlRoutes = require("./routes/urlroutes");
const shortUrlRoutes = require("./routes/shorturlroutes");
const metricRoutes = require("./routes/metricroutes");

// Import middleware
const authentication = require("./Middleware/authentication");
const err_handaling = require("./Middleware/err_handaling");

// Import MongoDB connection
const connectDB = require("./mangodb");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Routes
app.use("/authservice", authServiceRoutes);
app.use("/api/urls", authentication, urlRoutes);
app.use("/api/shorturls", authentication, shortUrlRoutes);
app.use("/api/metrics", authentication, metricRoutes);
app.get("/getcontact", authentication, setup.getcontact);

// Main route - check authentication and redirect accordingly
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'html', 'temp.html'));
});

// Main dashboard route - requires authentication
app.get("/main", authentication, (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'html', 'main.html'));
});

// Sign in page
app.get("/signin", (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'html', 'signin.html'));
});

// Sign up page
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'html', 'signup.html'));
});

// Error handling
app.use(err_handaling);

// URL redirection endpoint (no auth required) - MUST be last
app.get("/:shortCode", async (req, res) => {
  try {
    const ShortUrl = require("./models/shorturl");
    const Analytics = require("./models/analytices");
    
    const shortUrl = await ShortUrl.findOne({ shortCode: req.params.shortCode });
    
    if (!shortUrl) {
      return res.status(404).json({ error: "Short URL not found" });
    }
    
    // Check if URL has expired
    if (shortUrl.ttl && new Date() > shortUrl.ttl) {
      return res.status(410).json({ error: "Short URL has expired" });
    }
    
    // Check rate limit
    if (shortUrl.rateLimit > 0 && shortUrl.usageCount >= shortUrl.rateLimit) {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }
    
    // Get client IP and location info
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const geoip = require("./commen/geoip");
    const location = geoip.getLocation(clientIP);
    
    // Record analytics
    const analytics = new Analytics({
      shortId: shortUrl._id,
      ip: clientIP,
      country: location.country,
      region: location.region,
      city: location.city,
      device: req.headers['user-agent']?.includes('Mobile') ? 'Mobile' : 'Desktop',
      browser: req.headers['user-agent']?.split(' ')[0] || 'Unknown'
    });
    await analytics.save();
    
    // Update usage count
    await ShortUrl.findByIdAndUpdate(shortUrl._id, { 
      $inc: { usageCount: 1 } 
    });
    
    // Redirect to destination
    res.redirect(shortUrl.destinationUrl);
  } catch (error) {
    console.error("Redirect error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(3000, () => {
  console.log("Backend running on port 3000");
});