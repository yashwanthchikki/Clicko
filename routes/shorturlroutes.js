const express = require('express');
const router = express.Router();
const ShortUrl = require('../models/shorturl');
const Destination = require('../models/destinantion');

// Get all short URLs for a destination
router.get('/destination/:destinationId', async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { destinationId } = req.params;
    
    // Verify the destination belongs to the user
    const destination = await Destination.findOne({ 
      _id: destinationId, 
      userId 
    });
    
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    
    const shortUrls = await ShortUrl.find({ destinationId }).sort({ createdAt: -1 });
    res.json(shortUrls);
  } catch (error) {
    next(error);
  }
});

// Get a specific short URL
router.get('/:id', async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const shortUrl = await ShortUrl.findById(req.params.id).populate('destinationId');
    
    if (!shortUrl || shortUrl.destinationId.userId !== userId) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
    
    res.json(shortUrl);
  } catch (error) {
    next(error);
  }
});

// Create a new short URL
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { destinationId, alias, ttl, rateLimit } = req.body;
    
    if (!destinationId) {
      return res.status(400).json({ error: 'Destination ID is required' });
    }
    
    // Verify the destination belongs to the user
    const destination = await Destination.findOne({ 
      _id: destinationId, 
      userId 
    });
    
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    
    // Generate alias if not provided
    let finalAlias = alias;
    if (!finalAlias) {
      finalAlias = destination.label.toLowerCase().replace(/[^a-z0-9]/g, '-');
      // Ensure uniqueness
      let counter = 1;
      let testAlias = finalAlias;
      while (await ShortUrl.findOne({ alias: testAlias })) {
        testAlias = `${finalAlias}-${counter}`;
        counter++;
      }
      finalAlias = testAlias;
    }
    
    const shortUrl = new ShortUrl({
      destinationId,
      alias: finalAlias,
      ttl: ttl ? new Date(ttl) : null,
      rateLimit: rateLimit || 0
    });
    
    await shortUrl.save();
    res.status(201).json(shortUrl);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Alias already exists' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// Update a short URL
router.put('/:id', async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { alias, ttl, rateLimit } = req.body;
    
    const shortUrl = await ShortUrl.findById(req.params.id).populate('destinationId');
    
    if (!shortUrl || shortUrl.destinationId.userId !== userId) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
    
    shortUrl.alias = alias || shortUrl.alias;
    shortUrl.ttl = ttl ? new Date(ttl) : shortUrl.ttl;
    shortUrl.rateLimit = rateLimit !== undefined ? rateLimit : shortUrl.rateLimit;
    
    await shortUrl.save();
    res.json(shortUrl);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Alias already exists' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// Delete a short URL
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const shortUrl = await ShortUrl.findById(req.params.id).populate('destinationId');
    
    if (!shortUrl || shortUrl.destinationId.userId !== userId) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
    
    await ShortUrl.findByIdAndDelete(req.params.id);
    res.json({ message: 'Short URL deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Generate QR code for a short URL
router.get('/:id/qr', async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const shortUrl = await ShortUrl.findById(req.params.id).populate('destinationId');
    
    if (!shortUrl || shortUrl.destinationId.userId !== userId) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
    
    const qrcode = require('../commen/qrcode');
    const fullUrl = `http://localhost:3000/${shortUrl.shortCode}`;
    const qrBuffer = await qrcode.generateQRCodeBuffer(fullUrl);
    
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="qr-${shortUrl.alias}.png"`
    });
    
    res.send(qrBuffer);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
