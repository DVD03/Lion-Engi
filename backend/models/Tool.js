const mongoose = require('mongoose');

const toolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tool / Equipment name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Power Tools',
        'Generators & Power',
        'Surveying & Measuring',
        'Heavy Machinery',
        'Welding & Cutting',
        'Concrete & Masonry',
        'Access & Scaffolding',
        'Hand Tools',
        'Cleaning Equipment',
        'Garden Tools',
        'Safety & PPE',
      ],
    },
    serialNumber: {
      type: String,
      required: [true, 'Serial number / Item code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    dailyRate: {
      type: Number,
      required: [true, 'Daily hire charge is required'],
      min: 0,
    },
    weeklyRate: {
      type: Number,
      default: function () {
        return Math.round(this.dailyRate * 6);
      },
      min: 0,
    },
    monthlyRate: {
      type: Number,
      default: function () {
        return Math.round(this.dailyRate * 22);
      },
      min: 0,
    },
    depositAmount: {
      type: Number,
      required: [true, 'Security deposit is required'],
      min: 0,
    },
    imageUrl: {
      type: String,
      default: 'default-tool-placeholder.png',
      trim: true,
    },
    meterReadingLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentMeterReading: {
      type: Number,
      default: 0,
      min: 0,
    },
    meterExcessHourlyRate: {
      type: Number,
      default: 500,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Available', 'Rented', 'Under Maintenance', 'Damaged'],
      default: 'Available',
    },
    condition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Needs Repair'],
      default: 'Good',
    },
    lastServicedDate: {
      type: Date,
      default: Date.now,
    },
    nextServiceDue: {
      type: Date,
    },
    maintenanceNotes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Aliases for equipment schema requirements
toolSchema.virtual('item_code').get(function () { return this.serialNumber; });
toolSchema.virtual('daily_rate').get(function () { return this.dailyRate; });
toolSchema.virtual('weekly_rate').get(function () { return this.weeklyRate; });
toolSchema.virtual('security_deposit').get(function () { return this.depositAmount; });

toolSchema.index({ name: 'text', serialNumber: 'text', category: 'text' });

module.exports = mongoose.model('Tool', toolSchema);
