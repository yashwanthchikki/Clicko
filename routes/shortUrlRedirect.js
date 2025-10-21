const express = require('express');
const router = express.Router();
const ShortUrl = require('../models/shorturl');
const Destination = require('../models/destinantion');

router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    // Find the short URL and populate the destination
    const shortUrl = await ShortUrl.findOne({ shortCode: code }).populate('destinationId');

    if (!shortUrl) return res.status(404).send('Short URL not found');

    // Optional: check if expired
    if (shortUrl.ttl && new Date() > shortUrl.ttl) {
      return res.status(410).send('Short URL expired');
    }

    // Increment usage count
    shortUrl.usageCount = (shortUrl.usageCount || 0) + 1;
    await shortUrl.save();

    // Redirect to the actual destination
    res.redirect(shortUrl.destinationId.destinationUrl);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
