const express = require('express');
const router = express.Router();
const Tool = require('../models/Tool');
const Customer = require('../models/Customer');
const Rental = require('../models/Rental');
const { protect, requireRole } = require('../middleware/authMiddleware');

// @route   GET /api/stats/dashboard
// @desc    Get dashboard KPI metrics (Admin only)
router.get('/dashboard', protect, requireRole('admin'), async (req, res) => {
  try {
    const totalTools = await Tool.countDocuments();
    const availableTools = await Tool.countDocuments({ status: 'Available' });
    const rentedToolsCount = await Tool.countDocuments({ status: 'Rented' });

    const totalCustomers = await Customer.countDocuments();

    const activeRentals = await Rental.countDocuments({ status: 'Active' });
    const overdueRentals = await Rental.countDocuments({ status: 'Overdue' });
    const completedRentals = await Rental.countDocuments({ status: 'Completed' });

    // Aggregate total rental revenue
    const revenueAgg = await Rental.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$rentAmount' },
          totalLateFees: { $sum: '$lateFee' },
          totalDamageFees: { $sum: '$damageFee' },
        },
      },
    ]);

    const revenue =
      revenueAgg.length > 0
        ? (revenueAgg[0].totalRevenue || 0) + (revenueAgg[0].totalLateFees || 0)
        : 0;

    // Recent 6 rentals
    const recentRentals = await Rental.find()
      .populate('user_id')
      .populate('customer')
      .populate('tool')
      .sort({ createdAt: -1 })
      .limit(6);

    // Category breakdown
    const categoryStats = await Tool.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          availableCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        kpis: {
          totalTools,
          availableTools,
          rentedToolsCount,
          totalCustomers,
          activeRentals,
          overdueRentals,
          completedRentals,
          totalRevenue: revenue,
        },
        categoryStats,
        recentRentals,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
