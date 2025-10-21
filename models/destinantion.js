const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  label: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  destinationUrl: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid URL format'
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
destinationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Destination", destinationSchema);