const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const activitySchema = new mongoose.Schema({
  action: { type: String, enum: ['created', 'status_changed', 'assigned', 'note_added'] },
  details: String,
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
});
 
const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  source: { type: String, default: 'website' },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'],
    default: 'New'
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  notes: [noteSchema],
  activities: [activitySchema]
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);