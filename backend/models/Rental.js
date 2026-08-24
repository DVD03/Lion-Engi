const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema(
  {
    rentalCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    tool: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tool',
      required: [true, 'Tool reference is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due / end date is required'],
    },
    actualReturnDate: {
      type: Date,
    },
    extendedDate: {
      type: Date,
    },
    rateTypeApplied: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly'],
      default: 'Daily',
    },
    rentAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    depositAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryMode: {
      type: String,
      enum: ['Store Pickup', 'Site Delivery', 'Self-Pickup'],
      default: 'Store Pickup',
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveryAddress: {
      type: String,
      default: '',
      trim: true,
    },
    startMeterReading: {
      type: Number,
      default: 0,
    },
    returnMeterReading: {
      type: Number,
      default: 0,
    },
    excessMeterHours: {
      type: Number,
      default: 0,
    },
    excessMeterFee: {
      type: Number,
      default: 0,
    },
    lateFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    damageFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    damageNotes: {
      type: String,
      default: '',
      trim: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceDue: {
      type: Number,
      default: 0,
      min: 0,
    },
    customer_nic: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Overdue', 'Completed', 'Cancelled', 'Pending', 'Pending Dispatch'],
      default: 'Active',
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Partially Paid', 'Credit'],
      default: 'Paid',
    },
    depositStatus: {
      type: String,
      enum: ['Held', 'Refunded', 'Partially Refunded', 'Deducted'],
      default: 'Held',
    },
    kycDocumentUrl: {
      type: String,
      default: '',
    },
    digitalSignature: {
      type: String,
      default: '',
    },
    preDispatchPhotos: {
      type: [String],
      default: [],
    },
    postReturnPhotos: {
      type: [String],
      default: [],
    },
    siteLocation: {
      type: String,
      default: 'General Site',
      trim: true,
    },
    returnNotes: {
      type: String,
      default: '',
      trim: true,
    },
    notificationsSent: [
      {
        channel: { type: String, default: 'WhatsApp' },
        type: { type: String, enum: ['Booking Confirmed', 'Return Reminder', 'Overdue Alert', 'Custom'] },
        sentAt: { type: Date, default: Date.now },
        recipient: String,
        message: String,
        status: { type: String, default: 'Delivered' },
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtuals for Booking table alignment
rentalSchema.virtual('equipment_id').get(function () { return this.tool; });
rentalSchema.virtual('start_date').get(function () { return this.startDate; });
rentalSchema.virtual('end_date').get(function () { return this.dueDate; });
rentalSchema.virtual('delivery_type').get(function () { return this.deliveryMode; });
rentalSchema.virtual('rental_status').get(function () { return this.status; });
rentalSchema.virtual('total_amount').get(function () { return this.totalAmount; });
rentalSchema.virtual('paid_amount').get(function () { return this.paidAmount; });
rentalSchema.virtual('balance_due').get(function () { return this.balanceDue; });

rentalSchema.index({ rentalCode: 1, user_id: 1, customer: 1, customer_nic: 1, tool: 1, status: 1 });

module.exports = mongoose.model('Rental', rentalSchema);
