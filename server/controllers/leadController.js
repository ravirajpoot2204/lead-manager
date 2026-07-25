const Lead = require('../models/lead');

// Public lead capture – no auth required
exports.createPublic = async (req, res) => {
  try {
    const { name, email, phone, source } = req.body;
    const lead = await Lead.create({
      name,
      email,
      phone,
      source,
      activities: [{
        action: 'created',
        details: 'Lead created via public form',
        timestamp: new Date()
      }]
    });
    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all leads with pagination & filtering
exports.list = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, assignedTo, search } = req.query;
    const query = {};

    // Role-based filtering: member sees only assigned leads
    if (req.user.role === 'member') {
      query.assignedTo = req.user._id;
    } else if (req.user.role === 'admin' && assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      leads,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single lead
exports.getOne = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('notes.createdBy', 'name')
      .populate('activities.performedBy', 'name');
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    // Member can only view assigned leads
    if (req.user.role === 'member' && 
        (!lead.assignedTo || lead.assignedTo._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update lead (status / assign)
exports.update = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    // Member can only update status of assigned leads
    if (req.user.role === 'member') {
      if (!lead.assignedTo || lead.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      // Remove assignment field if member tries to change it
      delete req.body.assignedTo;
    }

    const oldStatus = lead.status;
    const oldAssigned = lead.assignedTo?.toString();

    if (req.body.status) lead.status = req.body.status;
    if (req.body.assignedTo) lead.assignedTo = req.body.assignedTo;

    // Activity logging
    if (req.body.status && req.body.status !== oldStatus) {
      lead.activities.push({
        action: 'status_changed',
        details: `Status changed from ${oldStatus} to ${req.body.status}`,
        performedBy: req.user._id,
        timestamp: new Date()
      });
    }
    if (req.body.assignedTo && req.body.assignedTo !== oldAssigned) {
      lead.activities.push({
        action: 'assigned',
        details: `Lead assigned to user ${req.body.assignedTo}`,
        performedBy: req.user._id,
        timestamp: new Date()
      });
    }
    await lead.save();
    res.json(lead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Add a note
exports.addNote = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    if (req.user.role === 'member' && 
        (!lead.assignedTo || lead.assignedTo.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    lead.notes.push({
      content: req.body.content,
      createdBy: req.user._id
    });
    lead.activities.push({
      action: 'note_added',
      details: 'Note added',
      performedBy: req.user._id,
      timestamp: new Date()
    });
    await lead.save();
    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};