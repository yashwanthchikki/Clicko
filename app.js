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
const shortUrlRedirect = require('./routes/shortUrlRedirect');



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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'html', 'temp.html'));
});
app.get("/main", authentication, (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'html', 'main.html'));
});
app.get("/signin", (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'html', 'signin.html'));
});
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'html', 'signup.html'));
});

// ---------- Error handling ----------
app.use(err_handaling);

// ---------- Short URL redirect ----------
app.use('/', shortUrlRedirect); // MUST be last
// Start server
app.listen(3000, () => {
  console.log("Backend running on port 3000");
});