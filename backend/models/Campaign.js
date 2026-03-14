const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  headline: { type: String },
  description: { type: String },
  cta: { type: String },
  bannerUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', campaignSchema);
