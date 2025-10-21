const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  shortId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ShortUrl", 
    required: true 
  },
  ip: { type: String, required: true },
  country: { type: String, default: "Unknown" },
  region: { type: String, default: "Unknown" },
  city: { type: String, default: "Unknown" },
  device: { 
    type: String, 
    enum: ["Mobile", "Desktop", "Tablet", "Unknown"],
    default: "Unknown" 
  },
  browser: { type: String, default: "Unknown" },
  timestamp: { type: Date, default: Date.now }
});

// Index for better query performance
analyticsSchema.index({ shortId: 1, timestamp: -1 });
analyticsSchema.index({ timestamp: -1 });

module.exports = mongoose.model("Analytics", analyticsSchema);