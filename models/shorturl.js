const mongoose = require("mongoose");
const shortid = require("shortid");

const shortUrlSchema = new mongoose.Schema({
  destinationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Destination", 
    required: true 
  },
  alias: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[a-z0-9-_]+$/.test(v);
      },
      message: 'Alias can only contain lowercase letters, numbers, hyphens, and underscores'
    }
  },
  shortCode: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => shortid.generate()
  },
  ttl: { 
    type: Date,
    default: null // null means never expires
  },
  rateLimit: { 
    type: Number, 
    default: 0 // 0 means unlimited
  },
  usageCount: { 
    type: Number, 
    default: 0 
  },
  createdAt: { type: Date, default: Date.now }
});

// Generate short code if not provided
shortUrlSchema.pre('save', function(next) {
  if (!this.shortCode) {
    this.shortCode = shortid.generate();
  }
  next();
});

module.exports = mongoose.model("ShortUrl", shortUrlSchema);