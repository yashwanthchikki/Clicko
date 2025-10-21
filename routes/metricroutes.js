const express = require('express');
const router = express.Router();
const Analytics = require('../models/analytices');
const ShortUrl = require('../models/shorturl');
const Destination = require('../models/destinantion');

// Get analytics for a specific short URL
router.get('/shorturl/:shortId', async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { shortId } = req.params;
    const { days = 30 } = req.query;
    
    // Verify the short URL belongs to the user
    const shortUrl = await ShortUrl.findById(shortId).populate('destinationId');
    if (!shortUrl || shortUrl.destinationId.userId !== userId) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const analytics = await Analytics.find({
      shortId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: -1 });
    
    // Aggregate data for charts
    const aggregatedData = aggregateAnalytics(analytics);
    
    res.json({
      shortUrl: {
        id: shortUrl._id,
        alias: shortUrl.alias,
        shortCode: shortUrl.shortCode,
        usageCount: shortUrl.usageCount,
        createdAt: shortUrl.createdAt
      },
      analytics: aggregatedData,
      rawData: analytics
    });
  } catch (error) {
    next(error);
  }
});

// Get analytics for a destination (all short URLs)
router.get('/destination/:destinationId', async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { destinationId } = req.params;
    const { days = 30 } = req.query;
    
    // Verify the destination belongs to the user
    const destination = await Destination.findOne({ 
      _id: destinationId, 
      userId 
    });
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    
    // Get all short URLs for this destination
    const shortUrls = await ShortUrl.find({ destinationId });
    const shortUrlIds = shortUrls.map(su => su._id);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const analytics = await Analytics.find({
      shortId: { $in: shortUrlIds },
      timestamp: { $gte: startDate }
    }).sort({ timestamp: -1 });
    
    // Aggregate data for charts
    const aggregatedData = aggregateAnalytics(analytics);
    
    // Add short URL breakdown
    const shortUrlBreakdown = shortUrls.map(su => ({
      id: su._id,
      alias: su.alias,
      shortCode: su.shortCode,
      usageCount: su.usageCount,
      clicks: analytics.filter(a => a.shortId.toString() === su._id.toString()).length
    }));
    
    res.json({
      destination: {
        id: destination._id,
        label: destination.label,
        destinationUrl: destination.destinationUrl
      },
      shortUrls: shortUrlBreakdown,
      analytics: aggregatedData,
      rawData: analytics
    });
  } catch (error) {
    next(error);
  }
});

// Get overall analytics for user
router.get('/overview', async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { days = 30 } = req.query;
    
    // Get all destinations for user
    const destinations = await Destination.find({ userId });
    const destinationIds = destinations.map(d => d._id);
    
    // Get all short URLs for these destinations
    const shortUrls = await ShortUrl.find({ 
      destinationId: { $in: destinationIds } 
    });
    const shortUrlIds = shortUrls.map(su => su._id);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const analytics = await Analytics.find({
      shortId: { $in: shortUrlIds },
      timestamp: { $gte: startDate }
    }).sort({ timestamp: -1 });
    
    // Aggregate data for charts
    const aggregatedData = aggregateAnalytics(analytics);
    
    res.json({
      totalDestinations: destinations.length,
      totalShortUrls: shortUrls.length,
      totalClicks: analytics.length,
      analytics: aggregatedData
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to aggregate analytics data
function aggregateAnalytics(analytics) {
  const totalClicks = analytics.length;
  const uniqueIPs = new Set(analytics.map(a => a.ip)).size;
  
  // Country distribution
  const countryData = {};
  analytics.forEach(a => {
    countryData[a.country] = (countryData[a.country] || 0) + 1;
  });
  
  // Device distribution
  const deviceData = {};
  analytics.forEach(a => {
    deviceData[a.device] = (deviceData[a.device] || 0) + 1;
  });
  
  // Browser distribution
  const browserData = {};
  analytics.forEach(a => {
    browserData[a.browser] = (browserData[a.browser] || 0) + 1;
  });
  
  // Time series data (clicks per day)
  const timeSeriesData = {};
  analytics.forEach(a => {
    const date = a.timestamp.toISOString().split('T')[0];
    timeSeriesData[date] = (timeSeriesData[date] || 0) + 1;
  });
  
  // Convert to arrays for charts
  const countryChart = Object.entries(countryData).map(([country, count]) => ({
    country,
    count,
    percentage: ((count / totalClicks) * 100).toFixed(1)
  }));
  
  const deviceChart = Object.entries(deviceData).map(([device, count]) => ({
    device,
    count,
    percentage: ((count / totalClicks) * 100).toFixed(1)
  }));
  
  const browserChart = Object.entries(browserData).map(([browser, count]) => ({
    browser,
    count,
    percentage: ((count / totalClicks) * 100).toFixed(1)
  }));
  
  const timeSeriesChart = Object.entries(timeSeriesData).map(([date, count]) => ({
    date,
    count
  })).sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return {
    summary: {
      totalClicks,
      uniqueVisitors: uniqueIPs
    },
    countryDistribution: countryChart,
    deviceDistribution: deviceChart,
    browserDistribution: browserChart,
    timeSeries: timeSeriesChart
  };
}

module.exports = router;
