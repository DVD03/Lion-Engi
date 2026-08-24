const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Rental = require('../models/Rental');
const { protect, requireRole } = require('../middleware/authMiddleware');

// @route   GET /api/customers/by-nic/:nic
// @desc    Find customer by NIC number, including outstanding balance and rental history
router.get('/by-nic/:nic', async (req, res) => {
  try {
    const cleanNic = req.params.nic.trim().toUpperCase();
    const customer = await Customer.findOne({ nicOrPassport: cleanNic });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer with this NIC not found' });
    }

    const rentals = await Rental.find({
      $or: [{ customer: customer._id }, { customer_nic: cleanNic }],
    })
      .populate('tool')
      .sort({ createdAt: -1 });

    // Calculate actual live outstanding balance
    let totalOutstanding = 0;
    let totalPaid = 0;
    let totalBilled = 0;

    rentals.forEach((r) => {
      totalBilled += Number(r.totalAmount || 0);
      totalPaid += Number(r.paidAmount || 0);
      if (r.balanceDue && r.balanceDue > 0) {
        totalOutstanding += Number(r.balanceDue);
      }
    });

    if (customer.outstandingBalance !== totalOutstanding) {
      customer.outstandingBalance = totalOutstanding;
      await customer.save();
    }

    res.json({
      success: true,
      data: {
        customer,
        outstandingBalance: totalOutstanding,
        totalBilled,
        totalPaid,
        rentals,
        activeRentalsCount: rentals.filter((r) => r.status === 'Active' || r.status === 'Overdue').length,
        unsettledRentalsCount: rentals.filter((r) => r.balanceDue > 0).length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/customers
// @desc    Get all customers with optional search and live outstanding balances (Admin only)
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

    // Attach active rental counts and verify outstanding balances
    const populatedCustomers = await Promise.all(
      customers.map(async (cust) => {
        const custRentals = await Rental.find({
          $or: [{ customer: cust._id }, { customer_nic: cust.nicOrPassport }],
        });

        let totalDue = 0;
        custRentals.forEach((r) => {
          if (r.balanceDue > 0) totalDue += r.balanceDue;
        });

        if (cust.outstandingBalance !== totalDue) {
          cust.outstandingBalance = totalDue;
          await cust.save();
        }

        return {
          ...cust.toObject(),
          outstandingBalance: totalDue,
          rentalCount: custRentals.length,
          activeCount: custRentals.filter((r) => r.status === 'Active' || r.status === 'Overdue').length,
          unsettledCount: custRentals.filter((r) => r.balanceDue > 0).length,
        };
      })
    );

    res.json({ success: true, count: populatedCustomers.length, data: populatedCustomers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/customers/:id
// @desc    Get single customer, summary KPIs, and their rental/payment ledger (Admin only)
router.get('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    const rentals = await Rental.find({
      $or: [{ customer: req.params.id }, { customer_nic: customer.nicOrPassport }],
    })
      .populate('tool')
      .sort({ createdAt: -1 });

    let totalBilled = 0;
    let totalPaid = 0;
    let totalDue = 0;

    rentals.forEach((r) => {
      totalBilled += Number(r.totalAmount || 0);
      totalPaid += Number(r.paidAmount || 0);
      if (r.balanceDue > 0) totalDue += Number(r.balanceDue);
    });

    if (customer.outstandingBalance !== totalDue) {
      customer.outstandingBalance = totalDue;
      await customer.save();
    }

    res.json({
      success: true,
      data: customer,
      summary: {
        totalBilled,
        totalPaid,
        outstandingBalance: totalDue,
        totalRentals: rentals.length,
        activeRentals: rentals.filter((r) => r.status === 'Active' || r.status === 'Overdue').length,
        unsettledRentals: rentals.filter((r) => r.balanceDue > 0).length,
      },
      rentals,
    });
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
