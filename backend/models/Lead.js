const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  website: { type: String, required: true },
  email: { type: String },
  industry: { type: String },
  leadScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Lead', leadSchema);
