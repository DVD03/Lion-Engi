const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Client/Representative name is required'],
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      required: [true, 'Primary contact number is required'],
      trim: true,
    },
    nicOrPassport: {
      type: String,
      required: [true, 'NIC / Passport number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    address: {
      type: String,
      required: [true, 'Physical address / Headquarters is required'],
      trim: true,
    },
  },
  { timestamps: true }
);

customerSchema.index({ name: 'text', phone: 'text', nicOrPassport: 'text', companyName: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
