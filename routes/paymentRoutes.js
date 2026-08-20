const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Rental = require('../models/Rental');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/payments
// @desc    Get payments (Admin gets all, customer gets own)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query.user_id = req.user._id;
    }

    const payments = await Payment.find(query)
      .populate('rental_id')
      .populate('user_id', 'name email phone_number')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/payments
// @desc    Record a new payment transaction
router.post('/', protect, async (req, res) => {
  try {
    const { rental_id, amount, payment_type, payment_method, transaction_ref } = req.body;

    const rental = await Rental.findById(rental_id);
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Referenced rental agreement not found' });
    }

    const ref = transaction_ref || `PAY-LE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payment = await Payment.create({
      rental_id,
      user_id: req.user._id,
      amount: Number(amount),
      payment_type: payment_type || 'Full Balance',
      payment_method: payment_method || 'Gateway',
      transaction_ref: ref,
      status: 'Successful',
      paid_at: new Date(),
    });

    // Update rental payment status
    rental.paymentStatus = 'Paid';
    await rental.save();

    res.status(201).json({
      success: true,
      data: payment,
      message: `Payment of LKR ${Number(amount).toLocaleString()} processed successfully via ${payment_method || 'Gateway'}!`,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
