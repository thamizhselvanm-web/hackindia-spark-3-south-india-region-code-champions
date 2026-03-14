const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['LEAD_ADDED', 'WEBSITE_ANALYZED', 'CAMPAIGN_GENERATED', 'EMAIL_SENT']
  },
  text: {
    type: String,
    required: true
  },
  iconType: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Activity', ActivitySchema);
