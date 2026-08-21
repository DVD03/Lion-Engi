const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Rental = require('../models/Rental');
const { protect, requireRole } = require('../middleware/authMiddleware');

// @route   GET /api/customers
// @desc    Get all customers with optional search (Admin only)
router.get('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { nicOrPassport: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
      ];
    }
    const customers = await Customer.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: customers.length, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/customers/:id
// @desc    Get single customer and their rental history (Admin only)
router.get('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    const rentals = await Rental.find({ customer: req.params.id }).populate('tool').sort({ createdAt: -1 });
    res.json({ success: true, data: customer, rentals });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/customers
// @desc    Create new customer (Admin only)
router.post('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const { name, companyName, phone, nicOrPassport, address } = req.body;

    const newCustomer = new Customer({
      name,
      companyName: companyName || '',
      phone,
      nicOrPassport: nicOrPassport.trim().toUpperCase(),
      address,
    });

    const saved = await newCustomer.save();
    res.status(201).json({ success: true, data: saved, message: 'Customer registered successfully' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'NIC / Passport number already exists' });
    }
    res.status(400).json({ success: false, error: err.message });
  }
});

// @route   PUT /api/customers/:id
// @desc    Update customer details (Admin only)
router.put('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: updated, message: 'Customer details updated' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @route   DELETE /api/customers/:id
// @desc    Delete customer (Admin only)
router.delete('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const activeRentals = await Rental.countDocuments({
      customer: req.params.id,
      status: { $in: ['Active', 'Overdue'] },
    });
    if (activeRentals > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete customer who currently has Active or Overdue rentals',
      });
    }

    await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
