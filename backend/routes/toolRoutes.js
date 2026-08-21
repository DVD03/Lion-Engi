const express = require('express');
const router = express.Router();
const Tool = require('../models/Tool');
const { protect, requireRole } = require('../middleware/authMiddleware');

// @route   GET /api/tools
// @desc    Get all tools with filtering & search (Admin only)
router.get('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = {};

    if (category && category !== 'All' && category !== 'undefined') {
      const cleanCat = category.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.category = { $regex: new RegExp(cleanCat, 'i') };
    }

    if (status && status !== 'All' && status !== 'undefined') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const tools = await Tool.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: tools.length, data: tools });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/tools/available
// @desc    Get only tools with status === 'Available' for public storefront and rental pickers
router.get('/available', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { status: 'Available' };

    if (category && category !== 'All' && category !== 'undefined') {
      const cleanCat = category.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.category = { $regex: new RegExp(cleanCat, 'i') };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const tools = await Tool.find(query).sort({ name: 1 });
    res.json({ success: true, count: tools.length, data: tools });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/tools/:id
// @desc    Get single tool (Any authenticated user)
router.get('/:id', protect, async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);
    if (!tool) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }
    res.json({ success: true, data: tool });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/tools
// @desc    Create a new tool with image support (Admin only)
router.post('/', protect, requireRole('admin'), async (req, res) => {
  try {
    let { name, category, serialNumber, dailyRate, depositAmount, imageUrl, status, condition } = req.body;

    if (!serialNumber) {
      const count = await Tool.countDocuments();
      const prefix = category ? category.substring(0, 3).toUpperCase() : 'ENG';
      serialNumber = `LE-${prefix}-${String(count + 1).padStart(3, '0')}`;
    }

    const newTool = new Tool({
      name,
      category,
      serialNumber: serialNumber.trim().toUpperCase(),
      dailyRate: Number(dailyRate),
      depositAmount: Number(depositAmount),
      imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : 'default-tool-placeholder.png',
      status: status || 'Available',
      condition: condition || 'Good',
    });

    const savedTool = await newTool.save();
    res.status(201).json({ success: true, data: savedTool, message: 'Tool added to inventory successfully' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Serial number / Tag already exists. Must be unique.' });
    }
    res.status(400).json({ success: false, error: err.message });
  }
});

// @route   PUT /api/tools/:id
// @desc    Update tool details including image (Admin only)
router.put('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);
    if (!tool) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }

    Object.assign(tool, req.body);
    const updated = await tool.save();
    res.json({ success: true, data: updated, message: 'Tool updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @route   DELETE /api/tools/:id
// @desc    Delete a tool (Admin only)
router.delete('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);
    if (!tool) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }
    if (tool.status === 'Rented') {
      return res.status(400).json({ success: false, message: 'Cannot delete tool that is currently Rented' });
    }

    await Tool.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Tool removed from inventory' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
