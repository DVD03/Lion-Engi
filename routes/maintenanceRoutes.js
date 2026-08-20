const express = require('express');
const router = express.Router();
const Maintenance = require('../models/Maintenance');
const Tool = require('../models/Tool');
const { protect, requireRole } = require('../middleware/authMiddleware');

// @route   GET /api/maintenance
// @desc    Get all maintenance logs with optional tool filter (Admin only)
router.get('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const { toolId, status } = req.query;
    let query = {};
    if (toolId) query.tool = toolId;
    if (status && status !== 'All') query.status = status;

    const logs = await Maintenance.find(query)
      .populate('tool')
      .sort({ serviceDate: -1 });

    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/maintenance
// @desc    Create new maintenance / repair log & optionally update tool status & lastServicedDate (Admin only)
router.post('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const { toolId, serviceDate, cost, repairNotes, technicianName, status, updateToolStatus } = req.body;

    if (!toolId || !repairNotes) {
      return res.status(400).json({
        success: false,
        message: 'Tool and repair notes are required',
      });
    }

    const tool = await Tool.findById(toolId);
    if (!tool) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }

    const newLog = new Maintenance({
      tool: tool._id,
      serviceDate: serviceDate ? new Date(serviceDate) : new Date(),
      cost: Number(cost) || 0,
      repairNotes,
      technicianName: technicianName || 'Lions Workshop Tech',
      status: status || 'Completed',
    });

    const savedLog = await newLog.save();

    // Update tool's maintenance metadata
    tool.lastServicedDate = new Date();
    tool.maintenanceNotes = repairNotes;

    // Set next service due ~90 days later
    const nextService = new Date();
    nextService.setDate(nextService.getDate() + 90);
    tool.nextServiceDue = nextService;

    if (updateToolStatus) {
      tool.status = updateToolStatus;
    } else if (status === 'Completed' && (tool.status === 'Under Maintenance' || tool.status === 'Damaged')) {
      tool.status = 'Available';
      tool.condition = 'Good';
    } else if (status === 'In Progress' || status === 'Scheduled') {
      tool.status = 'Under Maintenance';
    }

    await tool.save();

    const populated = await Maintenance.findById(savedLog._id).populate('tool');
    res.status(201).json({
      success: true,
      data: populated,
      message: `Maintenance logged for ${tool.name}. Tool status: ${tool.status}.`,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @route   DELETE /api/maintenance/:id
// @desc    Delete a maintenance log (Admin only)
router.delete('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    await Maintenance.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Maintenance record removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
