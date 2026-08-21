const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    tool: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tool',
      required: [true, 'Tool reference is required'],
    },
    serviceDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    repairNotes: {
      type: String,
      required: [true, 'Repair / maintenance description is required'],
      trim: true,
    },
    technicianName: {
      type: String,
      default: 'Lions Workshop Tech',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed'],
      default: 'Completed',
    },
  },
  { timestamps: true }
);

maintenanceSchema.index({ tool: 1, serviceDate: -1 });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
