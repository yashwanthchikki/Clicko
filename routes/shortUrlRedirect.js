const express = require('express');
const router = express.Router();
const ShortUrl = require('../models/shorturl');
const Analytics = require('../models/analytices');
const { getLocation } = require('../commen/geoip'); 

router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    // Find the short URL and populate the destination
    const shortUrl = await ShortUrl.findOne({ shortCode: code }).populate('destinationId');
    if (!shortUrl) return res.status(404).send('Short URL not found');

    // Check if the short URL has expired
    if (shortUrl.ttl && new Date() > shortUrl.ttl) {
      return res.status(410).send('Short URL expired');
    }

    // Increment usage count
    shortUrl.usageCount = (shortUrl.usageCount || 0) + 1;
    await shortUrl.save();

    // Capture analytics
    const ip = req.ip || req.connection.remoteAddress;
    const location = getLocation(ip); // uses your helper
    const ua = req.headers['user-agent'] || '';
    let device = 'Unknown';
    if (/mobile/i.test(ua)) device = 'Mobile';
    else if (/tablet/i.test(ua)) device = 'Tablet';
    else if (/desktop/i.test(ua)) device = 'Desktop';

    await Analytics.create({
      shortId: shortUrl._id,
      ip,
      country: location.country,
      region: location.region,
      city: location.city,
      device,
      browser: ua
    });

    // Redirect to the actual destination URL
    res.redirect(shortUrl.destinationId.destinationUrl);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
