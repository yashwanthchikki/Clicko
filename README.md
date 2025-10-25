# Clicko - Professional URL Shortener

A full-stack URL shortening service with built-in analytics, QR code generation, and comprehensive metrics tracking.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Usage Guide](#usage-guide)

## ✨ Features

- **URL Shortening**: Create short, memorable URLs with custom aliases
- **QR Code Generation**: Automatically generate QR codes for shortened URLs
- **Analytics & Metrics**: Track:
  - Click counts and unique visitors
  - Geographic data (country, region, city)
  - Device types (Mobile, Desktop, Tablet)
  - Browser information
  - Time-series click data
- **User Authentication**: Secure signin/signup with JWT
- **URL Management**: Full CRUD operations on shortened URLs
- **TTL Support**: Set expiration dates on short URLs
- **Rate Limiting**: Control usage limits per short URL
- **Custom Aliases**: Create memorable short URL aliases or use auto-generated codes
- **Destination Management**: Organize and manage original URLs

## 🛠️ Technology Stack

### Backend
- **Framework**: Express.js 4.18
- **Database**: MongoDB with Mongoose 7.5
- **Authentication**: JWT & bcrypt
- **ID Generation**: shortid, nanoid

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript

### Key Libraries
- **geoip-lite**: Geographic IP location tracking
- **qrcode**: QR code generation
- **cors**: Cross-Origin Resource Sharing
- **cookie-parser**: Cookie handling
- **dotenv**: Environment variable management

## 📁 Project Structure

```
clicko/
├── app.js                 # Main Express application entry point
├── package.json          # Project dependencies
├── .env                  # Environment variables (not in repo)
├── .gitignore            # Git ignore rules
│
├── models/               # Mongoose schemas
│   ├── shorturl.js       # Short URL model
│   ├── destinantion.js   # Destination URL model
│   └── analytices.js     # Analytics model
│
├── routes/               # API route handlers
│   ├── shorturlroutes.js # Short URL CRUD and QR routes
│   ├── urlroutes.js      # Destination URL routes
│   ├── metricroutes.js   # Analytics and metrics routes
│   └── shortUrlRedirect.js # Redirect handling
│
├── authservice/          # Authentication service
│   ├── index.js
│   ├── routes.js         # Auth endpoints
│   ├── controller.js     # Auth logic
│   └── db.js             # SQLite auth database
│
├── Middleware/           # Express middleware
│   ├── authentication.js # JWT verification
│   ├── autharisation.js  # Authorization checks
│   ├── err_handaling.js  # Error handling
│   └── logging.js        # Request logging
│
├── frontend/             # Frontend assets
│   ├── html/             # HTML pages
│   │   ├── main.html     # Dashboard
│   │   ├── signin.html   # Login page
│   │   └── signup.html   # Registration page
│   ├── js/               # JavaScript files
│   │   ├── auth.js       # Auth logic
│   │   └── main.js       # Main app logic
│   └── css/              # Stylesheets
│       ├── auth.css
│       └── main.css
│
├── commen/               # Common utilities
│   ├── qrcode.js         # QR code generation
│   └── geoip.js          # GeoIP utilities
│
├── setup/                # Setup/initialization
│   ├── index.js
│   └── controller.js
│
└── mangodb.js            # MongoDB connection
```

## 📦 Installation

### Prerequisites
- Node.js >= 14.0.0
- MongoDB (local or Atlas)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clicko
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment variables**
   ```bash
   cp .env.example .env
   ```

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/clicko
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clicko

# JWT Secret
JWT_SECRET=your_secret_key_here

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 🚀 Running the Application

### Development Mode
```bash
npm start
```

The application will start on `http://localhost:3000`

### With Nodemon (auto-reload on changes)
```bash
npm install -g nodemon
nodemon app.js
```

## 📡 API Endpoints

### Authentication
- `POST /authservice/signup` - Register new user
- `POST /authservice/signin` - Login user
- `POST /authservice/logout` - Logout user

### URLs (Destinations)
- `GET /api/urls` - Get all destination URLs
- `POST /api/urls` - Create new destination URL
- `GET /api/urls/:id` - Get specific destination
- `PUT /api/urls/:id` - Update destination
- `DELETE /api/urls/:id` - Delete destination

### Short URLs
- `POST /api/shorturls` - Create short URL
- `GET /api/shorturls/:id` - Get short URL details
- `PUT /api/shorturls/:id` - Update short URL
- `DELETE /api/shorturls/:id` - Delete short URL
- `GET /api/shorturls/qr/:id` - Generate QR code
- `GET /api/shorturls/destination/:destinationId` - Get all short URLs for a destination
- `GET /:alias` - Redirect to destination (public)

### Metrics & Analytics
- `GET /api/metrics/shorturl/:shortId` - Analytics for specific short URL
- `GET /api/metrics/destination/:destinationId` - Analytics for destination
- `GET /api/metrics/overview` - Overall user analytics

### Pages
- `GET /` - Landing page
- `GET /signin` - Sign in page
- `GET /signup` - Sign up page
- `GET /main` - Dashboard (requires authentication)
- `GET /getcontact` - Get contact information

## 💾 Database Models

### Short URL Model
```
{
  destinationId: ObjectId (ref: Destination),
  alias: String (unique, lowercase),
  shortCode: String (unique, auto-generated),
  ttl: Date (expiration, optional),
  rateLimit: Number (0 = unlimited),
  usageCount: Number,
  createdAt: Date
}
```

### Destination Model
```
{
  userId: String (required),
  label: String,
  description: String,
  destinationUrl: String (must be valid URL),
  createdAt: Date,
  updatedAt: Date
}
```

### Analytics Model
```
{
  shortId: ObjectId (ref: ShortUrl),
  ip: String,
  country: String,
  region: String,
  city: String,
  device: String (Mobile|Desktop|Tablet|Unknown),
  browser: String,
  timestamp: Date
}
```

## 📊 Usage Guide

### Creating a Short URL

1. Sign up for an account
2. Create a destination (original URL)
3. Create a short URL for that destination
4. Share the short URL or scan the QR code

### Viewing Analytics

- Navigate to the dashboard
- Select a destination or short URL
- View detailed analytics including:
  - Total clicks and unique visitors
  - Geographic distribution
  - Device breakdown
  - Browser information
  - Time-series click trends

### Custom Aliases

You can specify a custom alias when creating a short URL:
- Alias must be lowercase
- Can contain letters, numbers, hyphens, and underscores
- Must be unique across the system
- If not provided, a random alias is generated

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation and sanitization
- Error handling middleware
- User isolation (users can only access their own URLs)

## 📝 License

MIT

## 👥 Author

Clicko Team

---

**Note**: This is a professional URL shortening service. For production deployment, ensure all environment variables are properly configured and MongoDB is running on a secure connection.