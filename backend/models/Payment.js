const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    rental_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      required: [true, 'Rental reference is required'],
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: 0,
    },
    payment_type: {
      type: String,
      enum: ['Security Deposit', 'Rental Fee', 'Late Fee', 'Damage Fee', 'Full Balance'],
      default: 'Full Balance',
    },
    payment_method: {
      type: String,
      enum: ['Card', 'Bank Transfer', 'Cash', 'Gateway'],
      default: 'Card',
    },
    transaction_ref: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Successful', 'Pending', 'Failed', 'Refunded'],
      default: 'Successful',
    },
    paid_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ rental_id: 1, user_id: 1, transaction_ref: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
