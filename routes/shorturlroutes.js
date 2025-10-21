const express = require('express');
const router = express.Router();
const { customAlphabet } = require('nanoid');
const ShortUrl = require('../models/shorturl'); 
const Destination = require('../models/destinantion');

// Nanoid generator for aliases
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

// -------------------- Routes -------------------- //

// 1. Get all short URLs for a destination
router.get('/destination/:destinationId', async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { destinationId } = req.params;
    
    const destination = await Destination.findOne({ _id: destinationId, userId });
    if (!destination) return res.status(404).json({ error: 'Destination not found' });

    const shortUrls = await ShortUrl.find({ destinationId }).sort({ createdAt: -1 });
    res.json(shortUrls);
  } catch (error) {
    next(error);
  }
});

// 2. Generate QR code for a short URL (must be before dynamic routes)
router.get('/:id/qr', async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const shortUrl = await ShortUrl.findById(req.params.id).populate('destinationId');
    
    if (!shortUrl || shortUrl.destinationId.userId !== userId) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
    
    const qrcode = require('../commen/qrcode');
    const fullUrl = `http://localhost:3000/${shortUrl.alias}`;
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

// 3. Get a specific short URL by ID
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

// 4. Create a new short URL
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { destinationId, alias, ttl, rateLimit } = req.body;

    if (!destinationId) return res.status(400).json({ error: 'Destination ID is required' });

    const destination = await Destination.findOne({ _id: destinationId, userId });
    if (!destination) return res.status(404).json({ error: 'Destination not found' });

    let finalAlias = alias || nanoid();
    while (await ShortUrl.findOne({ alias: finalAlias })) {
      finalAlias = nanoid();
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
    if (error.code === 11000) return res.status(400).json({ error: 'Alias already exists' });
    if (error.name === 'ValidationError') return res.status(400).json({ error: error.message });
    next(error);
  }
});

// 5. Update a short URL by ID
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
    if (error.code === 11000) return res.status(400).json({ error: 'Alias already exists' });
    if (error.name === 'ValidationError') return res.status(400).json({ error: error.message });
    next(error);
  }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Delete the short URL
        const deleted = await ShortUrl.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Short URL not found' });
        }

        return res.status(200).json({ message: 'Short URL deleted successfully' });
    } catch (error) {
        console.error('Error deleting short URL:', error);
        return res.status(500).json({ error: 'Server error while deleting short URL' });
    }
});

router.get('/:alias', async (req, res, next) => {
  try {
    const { alias } = req.params;
    const shortUrl = await ShortUrl.findOne({ alias }).populate('destinationId');
    if (!shortUrl) return res.status(404).send('Short URL not found');

    if (shortUrl.ttl && new Date() > shortUrl.ttl) return res.status(410).send('Short URL expired');

    shortUrl.visits = (shortUrl.visits || 0) + 1;
    await shortUrl.save();

    res.redirect(shortUrl.destinationId.destinationUrl);
  } catch (error) {
    next(error);
  }
});


// -------------------- Export -------------------- //
module.exports = router;
