const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Rental = require('../models/Rental');
const { syncCustomerOutstandingBalance } = require('../utils/customerBalance');
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
      .populate('user_id', 'name email phone_number nic_or_passport')
      .populate('customer_id')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/payments
// @desc    Record a new payment transaction & sync balances
router.post('/', protect, async (req, res) => {
  try {
    const { rental_id, amount, payment_type, payment_method, transaction_ref, notes } = req.body;

    const rental = await Rental.findById(rental_id)
      .populate('customer')
      .populate('user_id');

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Referenced rental agreement not found' });
    }

    const payAmt = Number(amount);
    if (!payAmt || payAmt <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than 0' });
    }

    const ref = transaction_ref || `PAY-LE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newPaidAmount = (rental.paidAmount || 0) + payAmt;
    const newBalanceDue = Math.max(0, rental.totalAmount - newPaidAmount);

    rental.paidAmount = newPaidAmount;
    rental.balanceDue = newBalanceDue;
    rental.paymentStatus = newBalanceDue === 0 ? 'Paid' : 'Partially Paid';
    await rental.save();

    const payment = await Payment.create({
      rental_id,
      user_id: req.user._id,
      customer_id: rental.customer ? (rental.customer._id || rental.customer) : null,
      customer_nic: rental.customer_nic || (rental.customer ? rental.customer.nicOrPassport : ''),
      amount: payAmt,
      payment_type: payment_type || (newBalanceDue === 0 ? 'Full Balance' : 'Partial Payment'),
      payment_method: payment_method || 'Card',
      transaction_ref: ref,
      notes: notes || `Direct payment for agreement ${rental.rentalCode}`,
      status: 'Successful',
      paid_at: new Date(),
    });

    const syncRes = await syncCustomerOutstandingBalance(
      rental.customer ? (rental.customer._id || rental.customer) : null,
      rental.customer_nic
    );

    res.status(201).json({
      success: true,
      data: payment,
      rental,
      customerOutstandingBalance: syncRes.outstandingBalance,
      message: `Payment of LKR ${payAmt.toLocaleString()} processed successfully via ${payment_method || 'Card'}! Remaining balance: LKR ${newBalanceDue.toLocaleString()}`,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
