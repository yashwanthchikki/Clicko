const express = require('express');
const router = express.Router();
const Destination = require('../models/destinantion');

// Get all destinations for a user
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const destinations = await Destination.find({ userId }).sort({ createdAt: -1 });
    res.json(destinations);
  } catch (error) {
    next(error);
  }
});

// Get a specific destination
router.get('/:id', async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const destination = await Destination.findOne({ 
      _id: req.params.id, 
      userId 
    });
    
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    
    res.json(destination);
  } catch (error) {
    next(error);
  }
});

// Create a new destination
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { label, description, destinationUrl } = req.body;
    
    if (!label || !destinationUrl) {
      return res.status(400).json({ error: 'Label and destination URL are required' });
    }
    
    const destination = new Destination({
      userId,
      label,
      description: description || '',
      destinationUrl
    });
    
    await destination.save();
    res.status(201).json(destination);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// Update a destination
router.put('/:id', async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { label, description, destinationUrl } = req.body;
    
    const destination = await Destination.findOneAndUpdate(
      { _id: req.params.id, userId },
      { 
        label, 
        description, 
        destinationUrl,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    
    res.json(destination);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// DELETE /api/urls/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    // Delete the destination
    const destination = await Destination.findOneAndDelete({ _id: req.params.id, userId });
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    // Delete associated short URLs
    await ShortUrl.deleteMany({ destinationId: req.params.id });

    return res.status(200).json({ message: 'Destination deleted successfully' });
  } catch (error) {
    console.error('Error deleting destination:', error);
    return res.status(500).json({ error: 'Server error while deleting destination' });
  }
});

module.exports = router;
