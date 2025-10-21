# 🔗 Clicko - Professional URL Shortener

A modern, feature-rich URL shortener platform with advanced analytics, QR code generation, and rate limiting capabilities.

## ✨ Features

### 🎯 Core Functionality
- **URL Shortening**: Create short, memorable URLs from long destination URLs
- **Custom Aliases**: Set human-readable aliases for your short URLs
- **TTL Support**: Set expiration dates for temporary URLs
- **Rate Limiting**: Control how many times a URL can be accessed
- **QR Code Generation**: Generate and download QR codes for easy sharing

### 📊 Analytics & Tracking
- **Real-time Analytics**: Track clicks, unique visitors, and engagement
- **Geographic Data**: See where your visitors are coming from (country, region, city)
- **Device & Browser Info**: Track device types and browser usage
- **Time Series Charts**: Visualize click patterns over time
- **Interactive Dashboards**: Beautiful charts and visualizations

### 🔐 Security & Management
- **User Authentication**: Secure JWT-based authentication system
- **User Management**: Sign up, sign in, and account management
- **Destination Management**: Organize URLs with labels and descriptions
- **Bulk Operations**: Manage multiple URLs efficiently

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Authentication**: SQLite-based user management with JWT tokens
- **Data Storage**: MongoDB for URLs, analytics, and user data
- **API**: RESTful API with comprehensive endpoints
- **Analytics**: Real-time tracking with GeoIP integration
- **Security**: Rate limiting, input validation, and error handling

### Frontend (Vanilla JavaScript)
- **Responsive Design**: Mobile-friendly interface
- **Modern UI**: Clean, professional design with smooth animations
- **Real-time Updates**: Live data without page refreshes
- **Interactive Charts**: Beautiful visualizations with Chart.js
- **Modal System**: Intuitive user interface for all operations

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Clicko
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5500
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open the frontend**
   - Serve the `frontend` folder using a local server (e.g., Live Server in VS Code)
   - Or use: `python -m http.server 5500` in the frontend directory
   - Navigate to `http://localhost:5500/html/signin.html`

## 📁 Project Structure

```
Clicko/
├── app.js                 # Main Express server
├── package.json           # Dependencies and scripts
├── .env.example          # Environment variables template
├── authservice/          # Authentication system (SQLite)
│   ├── controller.js     # Auth logic
│   ├── db.js            # SQLite connection
│   ├── routes.js        # Auth routes
│   └── db.db            # SQLite database
├── models/              # MongoDB models
│   ├── destinantion.js  # Destination URL model
│   ├── shorturl.js     # Short URL model
│   └── analytices.js   # Analytics model
├── routes/              # API routes
│   ├── urlroutes.js    # Destination CRUD
│   ├── shorturlroutes.js # Short URL CRUD
│   └── metricroutes.js # Analytics endpoints
├── Middleware/          # Express middleware
│   ├── authentication.js # JWT auth
│   └── err_handaling.js # Error handling
├── commen/              # Utility functions
│   ├── geoip.js        # GeoIP location service
│   └── qrcode.js       # QR code generation
└── frontend/            # Frontend application
    ├── html/           # HTML pages
    ├── css/            # Stylesheets
    └── js/             # JavaScript files
```

## 🔧 API Endpoints

### Authentication
- `POST /authservice/signup` - User registration
- `POST /authservice/signin` - User login
- `GET /authservice/check` - Verify authentication
- `GET /authservice/delete` - Delete account

### Destinations
- `GET /api/urls` - Get all destinations
- `POST /api/urls` - Create destination
- `GET /api/urls/:id` - Get specific destination
- `PUT /api/urls/:id` - Update destination
- `DELETE /api/urls/:id` - Delete destination

### Short URLs
- `GET /api/shorturls/destination/:id` - Get short URLs for destination
- `POST /api/shorturls` - Create short URL
- `GET /api/shorturls/:id` - Get specific short URL
- `PUT /api/shorturls/:id` - Update short URL
- `DELETE /api/shorturls/:id` - Delete short URL
- `GET /api/shorturls/:id/qr` - Download QR code

### Analytics
- `GET /api/metrics/shorturl/:id` - Get short URL analytics
- `GET /api/metrics/destination/:id` - Get destination analytics
- `GET /api/metrics/overview` - Get user overview

### URL Redirection
- `GET /:shortCode` - Redirect to destination URL

## 🎨 User Interface

### Main Dashboard
- **Add New Destinations**: Create and manage destination URLs
- **Destination Cards**: Visual cards showing URL information
- **Quick Actions**: View, edit, and manage URLs
- **Real-time Stats**: Live click counts and usage statistics

### Destination Management
- **URL Details**: Edit labels, descriptions, and destination URLs
- **Short URL Creation**: Generate multiple short URLs per destination
- **QR Code Generation**: Download QR codes for easy sharing
- **Analytics View**: Comprehensive analytics and visualizations

### Analytics Dashboard
- **Click Timeline**: Time-series chart of clicks over time
- **Geographic Distribution**: World map showing visitor locations
- **Device & Browser Stats**: Breakdown by device type and browser
- **Performance Metrics**: Total clicks, unique visitors, and more

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive validation for all inputs
- **Rate Limiting**: Built-in rate limiting for URL access
- **CORS Protection**: Proper CORS configuration
- **Error Handling**: Secure error handling without information leakage

## 🚀 Deployment

### Environment Setup
1. Set up MongoDB Atlas cluster
2. Configure environment variables
3. Set up domain and SSL certificates
4. Configure reverse proxy (nginx/Apache)

### Production Considerations
- Use environment variables for sensitive data
- Enable HTTPS for all communications
- Set up proper logging and monitoring
- Configure database backups
- Use a process manager (PM2)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Future Features

- [ ] Bulk URL import/export
- [ ] Custom domains
- [ ] Advanced analytics filters
- [ ] API rate limiting
- [ ] Webhook notifications
- [ ] Team collaboration features
- [ ] White-label solutions

---

**Built with ❤️ using Node.js, Express, MongoDB, and modern web technologies.**