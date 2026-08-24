const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');
const Tool = require('../models/Tool');
const Customer = require('../models/Customer');
const User = require('../models/User');
const Payment = require('../models/Payment');
const PDFDocument = require('pdfkit');
const NotificationService = require('../services/notificationService');
const { syncCustomerOutstandingBalance } = require('../utils/customerBalance');
const { protect, requireRole } = require('../middleware/authMiddleware');

// Helper to auto-update overdue rentals
async function checkAndUpdateOverdueRentals() {
  const now = new Date();
  await Rental.updateMany(
    { status: 'Active', dueDate: { $lt: now } },
    { $set: { status: 'Overdue' } }
  );
}

// Tiered Pricing Calculation
function calculateTieredRent(tool, days) {
  const dailyRate = tool.dailyRate;
  const weeklyRate = tool.weeklyRate || dailyRate * 6;
  const monthlyRate = tool.monthlyRate || dailyRate * 22;

  if (days >= 30) {
    const months = Math.floor(days / 30);
    const remDays = days % 30;
    const baseAmount = Math.round(months * monthlyRate + remDays * (monthlyRate / 30));
    return { rentAmount: baseAmount, rateType: 'Monthly' };
  } else if (days >= 7) {
    const weeks = Math.floor(days / 7);
    const remDays = days % 7;
    const baseAmount = Math.round(weeks * weeklyRate + remDays * (weeklyRate / 7));
    return { rentAmount: baseAmount, rateType: 'Weekly' };
  } else {
    return { rentAmount: dailyRate * days, rateType: 'Daily' };
  }
}

// @route   POST /api/rentals/validate-availability
// @desc    Check if tool is available for specific date range (Public / Customer)
router.post('/validate-availability', async (req, res) => {
  try {
    const { toolId, startDate, dueDate } = req.body;
    const tool = await Tool.findById(toolId);
    if (!tool) return res.status(404).json({ success: false, message: 'Tool not found' });

    if (tool.status === 'Under Maintenance' || tool.status === 'Damaged') {
      return res.json({ success: false, available: false, reason: `Tool is currently ${tool.status}` });
    }

    const start = new Date(startDate);
    const due = new Date(dueDate);

    const conflictingRental = await Rental.findOne({
      tool: toolId,
      status: { $in: ['Active', 'Overdue'] },
      $or: [{ startDate: { $lte: due }, dueDate: { $gte: start } }],
    });

    if (conflictingRental) {
      return res.json({
        success: true,
        available: false,
        reason: `Tool is booked under agreement ${conflictingRental.rentalCode} until ${new Date(conflictingRental.dueDate).toLocaleDateString()}`,
      });
    }

    res.json({ success: true, available: true, message: 'Tool is available for selected dates!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/rentals/my-rentals
// @desc    Customer Portal - Get logged-in user's rentals & leases
router.get('/my-rentals', protect, async (req, res) => {
  try {
    await checkAndUpdateOverdueRentals();
    const rentals = await Rental.find({ user_id: req.user._id })
      .populate('tool')
      .populate('user_id', 'name email phone_number nic_or_passport')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: rentals.length, data: rentals });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/rentals
// @desc    Admin - Get all rentals with filtering
router.get('/', protect, async (req, res) => {
  try {
    await checkAndUpdateOverdueRentals();

    let query = {};
    if (req.user.role === 'customer') {
      query.user_id = req.user._id;
    } else {
      const { status, search } = req.query;
      if (status && status !== 'All') query.status = status;
      if (search) {
        query.$or = [
          { rentalCode: { $regex: search, $options: 'i' } },
          { siteLocation: { $regex: search, $options: 'i' } },
        ];
      }
    }

    const rentals = await Rental.find(query)
      .populate('customer')
      .populate('user_id', 'name email phone_number nic_or_passport')
      .populate('tool')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: rentals.length, data: rentals });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/rentals/:id
// @desc    Get single rental details
router.get('/:id', async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('customer')
      .populate('user_id', 'name email phone_number nic_or_passport company_name')
      .populate('tool');

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental agreement not found' });
    }

    res.json({ success: true, data: rental });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/rentals
// @desc    Create new rental agreement (Admin or Customer Booking) with Partial Payment & NIC Tracking
router.post('/', async (req, res) => {
  try {
    const {
      customerId,
      userId,
      customerNic,
      toolId,
      startDate,
      dueDate,
      siteLocation,
      deliveryMode,
      deliveryFee,
      deliveryAddress,
      paidAmount,
      initialPaymentAmount,
      paymentMethod,
      paymentStatus,
      notes,
      kycDocumentUrl,
      digitalSignature,
      preDispatchPhotos,
      startMeterReading,
    } = req.body;

    const tool = await Tool.findById(toolId);
    if (!tool) {
      return res.status(404).json({ success: false, message: 'Referenced tool not found' });
    }

    if (tool.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Tool "${tool.name}" is currently ${tool.status} and cannot be rented`,
      });
    }

    // Resolve user & customer IDs and NIC
    let assignedUserId = userId;
    let resolvedCustomerId = customerId;
    let resolvedNic = customerNic ? customerNic.trim().toUpperCase() : '';

    if (resolvedCustomerId) {
      const custObj = await Customer.findById(resolvedCustomerId);
      if (custObj && !resolvedNic) resolvedNic = custObj.nicOrPassport;
    } else if (resolvedNic) {
      const custObj = await Customer.findOne({ nicOrPassport: resolvedNic });
      if (custObj) resolvedCustomerId = custObj._id;
    }

    if (!assignedUserId) {
      // Find or fallback to matching user by NIC or first user/customer
      if (resolvedNic) {
        const userByNic = await User.findOne({ nic_or_passport: resolvedNic });
        if (userByNic) assignedUserId = userByNic._id;
      }
      if (!assignedUserId) {
        const existingUser = await User.findOne({ role: 'customer' });
        if (existingUser) assignedUserId = existingUser._id;
        else {
          const adminUser = await User.findOne({ role: 'admin' });
          assignedUserId = adminUser ? adminUser._id : (resolvedCustomerId || null);
        }
      }
    }

    if (!resolvedNic && assignedUserId) {
      const u = await User.findById(assignedUserId);
      if (u && u.nic_or_passport) resolvedNic = u.nic_or_passport;
    }

    const start = new Date(startDate);
    const due = new Date(dueDate);
    const diffTime = due.getTime() - start.getTime();
    const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const { rentAmount, rateType } = calculateTieredRent(tool, durationDays);
    const depositAmount = tool.depositAmount;
    const transFee = deliveryMode === 'Site Delivery' ? Number(deliveryFee) || 3500 : 0;
    const totalAmount = rentAmount + depositAmount + transFee;

    // Calculate paid amount and remaining balance due
    let parsedPaidAmount = 0;
    if (paidAmount !== undefined && paidAmount !== null && paidAmount !== '') {
      parsedPaidAmount = Math.max(0, Number(paidAmount));
    } else if (initialPaymentAmount !== undefined && initialPaymentAmount !== null && initialPaymentAmount !== '') {
      parsedPaidAmount = Math.max(0, Number(initialPaymentAmount));
    } else if (paymentStatus === 'Paid' || !paymentStatus) {
      // Default to full payment if not explicitly given
      parsedPaidAmount = totalAmount;
    }

    // Ensure paid amount does not exceed totalAmount
    parsedPaidAmount = Math.min(totalAmount, parsedPaidAmount);
    const balanceDue = Math.max(0, totalAmount - parsedPaidAmount);

    let calculatedPaymentStatus = 'Paid';
    if (balanceDue === 0) {
      calculatedPaymentStatus = 'Paid';
    } else if (parsedPaidAmount > 0) {
      calculatedPaymentStatus = 'Partially Paid';
    } else {
      calculatedPaymentStatus = 'Pending';
    }

    const count = await Rental.countDocuments();
    const rentalCode = `LE-RENT-${String(count + 1001).padStart(4, '0')}`;

    const newRental = new Rental({
      rentalCode,
      user_id: assignedUserId,
      customer: resolvedCustomerId || assignedUserId,
      customer_nic: resolvedNic,
      tool: toolId,
      startDate: start,
      dueDate: due,
      rateTypeApplied: rateType,
      rentAmount,
      depositAmount,
      deliveryMode: deliveryMode || 'Store Pickup',
      deliveryFee: transFee,
      deliveryAddress: deliveryAddress || siteLocation || 'Direct Store Pickup',
      startMeterReading: Number(startMeterReading) || tool.currentMeterReading || 0,
      totalAmount,
      paidAmount: parsedPaidAmount,
      balanceDue,
      status: 'Active',
      paymentStatus: calculatedPaymentStatus,
      depositStatus: 'Held',
      siteLocation: siteLocation || 'Project Site',
      returnNotes: notes || '',
      kycDocumentUrl: kycDocumentUrl || '',
      digitalSignature: digitalSignature || '',
      preDispatchPhotos: Array.isArray(preDispatchPhotos) ? preDispatchPhotos : preDispatchPhotos ? [preDispatchPhotos] : [],
    });

    const savedRental = await newRental.save();

    // Transition tool to Rented
    tool.status = 'Rented';
    if (startMeterReading) tool.currentMeterReading = Number(startMeterReading);
    await tool.save();

    // Record initial payment transaction if any payment was made
    if (parsedPaidAmount > 0) {
      await Payment.create({
        rental_id: savedRental._id,
        user_id: assignedUserId,
        customer_id: resolvedCustomerId || null,
        customer_nic: resolvedNic,
        amount: parsedPaidAmount,
        payment_type: parsedPaidAmount >= totalAmount ? 'Full Balance' : 'Partial Payment',
        payment_method: paymentMethod || 'Gateway',
        transaction_ref: `PAY-LE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        notes: `Initial ${parsedPaidAmount >= totalAmount ? 'full payment' : 'partial payment'} upon lease booking`,
        status: 'Successful',
        paid_at: new Date(),
      });
    }

    // Recalculate customer's total outstanding balance
    await syncCustomerOutstandingBalance(resolvedCustomerId, resolvedNic);

    // Populate and trigger automated WhatsApp alert
    const populated = await Rental.findById(savedRental._id)
      .populate('customer')
      .populate('user_id', 'name email phone_number')
      .populate('tool');

    const alertResult = await NotificationService.sendAlert(populated, 'Booking Confirmed');
    populated.notificationsSent.push(alertResult);
    await populated.save();

    res.status(201).json({
      success: true,
      data: populated,
      message: `Rental agreement created successfully! Paid: LKR ${parsedPaidAmount.toLocaleString()}, Balance Due: LKR ${balanceDue.toLocaleString()} (Status: ${calculatedPaymentStatus})`,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @route   PATCH /api/rentals/:id/dispatch
// @desc    Admin / Yard Staff - Perform Pre-Dispatch Inspection & Record Meter Reading
router.patch('/:id/dispatch', protect, requireRole('admin'), async (req, res) => {
  try {
    const { startMeterReading, preDispatchPhotos, initialCondition, dispatchNotes } = req.body;

    const rental = await Rental.findById(req.params.id)
      .populate('customer')
      .populate('user_id')
      .populate('tool');

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental agreement not found' });
    }

    if (startMeterReading !== undefined && startMeterReading !== null) {
      rental.startMeterReading = Number(startMeterReading);
    }

    if (preDispatchPhotos) {
      rental.preDispatchPhotos = Array.isArray(preDispatchPhotos) ? preDispatchPhotos : [preDispatchPhotos];
    }

    if (dispatchNotes) {
      rental.returnNotes = `${rental.returnNotes ? rental.returnNotes + ' | ' : ''}Yard Dispatch: ${dispatchNotes}`;
    }

    rental.status = 'Active';
    await rental.save();

    if (rental.tool) {
      const tool = await Tool.findById(rental.tool._id);
      if (tool) {
        tool.status = 'Rented';
        if (startMeterReading) tool.currentMeterReading = Number(startMeterReading);
        if (initialCondition) tool.condition = initialCondition;
        await tool.save();
      }
    }

    res.json({
      success: true,
      data: rental,
      message: `Equipment dispatched successfully with start meter reading ${rental.startMeterReading} Hrs!`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   PATCH /api/rentals/:id/return
// @desc    Process return with Inspection, Meter Limits, and Damage settlement (Admin Only)
router.patch('/:id/return', protect, requireRole('admin'), async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('tool')
      .populate('customer')
      .populate('user_id');

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental agreement not found' });
    }

    if (rental.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Agreement already marked as completed' });
    }

    const {
      actualReturnDate,
      damageFee,
      damageNotes,
      returnNotes,
      newToolStatus,
      newToolCondition,
      returnMeterReading,
      postReturnPhotos,
    } = req.body;

    const returnDate = actualReturnDate ? new Date(actualReturnDate) : new Date();
    rental.actualReturnDate = returnDate;

    // Dynamic late fee
    const dueDate = new Date(rental.dueDate);
    let calculatedLateFee = 0;
    if (returnDate > dueDate && rental.tool) {
      const diffTime = returnDate.getTime() - dueDate.getTime();
      const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      calculatedLateFee = overdueDays * rental.tool.dailyRate;
    }
    rental.lateFee = calculatedLateFee;

    // Meter reading excess fee calculation
    let excessMeterHours = 0;
    let excessMeterFee = 0;
    const finalMeter = Number(returnMeterReading) || rental.startMeterReading;
    rental.returnMeterReading = finalMeter;

    if (rental.tool && rental.tool.meterReadingLimit > 0) {
      const durationDays = Math.max(1, Math.ceil((returnDate - new Date(rental.startDate)) / (1000 * 60 * 60 * 24)));
      const maxAllowedHours = rental.tool.meterReadingLimit * durationDays;
      const hoursRun = finalMeter - rental.startMeterReading;
      if (hoursRun > maxAllowedHours) {
        excessMeterHours = hoursRun - maxAllowedHours;
        excessMeterFee = excessMeterHours * (rental.tool.meterExcessHourlyRate || 500);
      }
    }
    rental.excessMeterHours = excessMeterHours;
    rental.excessMeterFee = excessMeterFee;

    const parsedDamageFee = Number(damageFee) || 0;
    rental.damageFee = parsedDamageFee;
    rental.damageNotes = damageNotes || '';
    rental.returnNotes = returnNotes || rental.returnNotes;

    if (postReturnPhotos) {
      rental.postReturnPhotos = Array.isArray(postReturnPhotos) ? postReturnPhotos : [postReturnPhotos];
    }

    const totalDeductions = calculatedLateFee + parsedDamageFee + excessMeterFee;
    const netDepositRefund = rental.depositAmount - totalDeductions;

    if (totalDeductions === 0) {
      rental.depositStatus = 'Refunded';
    } else if (netDepositRefund > 0) {
      rental.depositStatus = 'Partially Refunded';
    } else {
      rental.depositStatus = 'Deducted';
    }

    // Update total contract bill amount including additional inspection deductions
    const updatedTotalAmount =
      (rental.rentAmount || 0) +
      (rental.depositAmount || 0) +
      (rental.deliveryFee || 0) +
      calculatedLateFee +
      parsedDamageFee +
      excessMeterFee;

    rental.totalAmount = updatedTotalAmount;

    // Handle return desk payment if customer made a payment at the counter
    const { returnPaymentAmount, returnPaymentMethod, returnPaymentNotes } = req.body;
    const parsedReturnPay = Number(returnPaymentAmount) || 0;

    if (parsedReturnPay > 0) {
      await Payment.create({
        rental_id: rental._id,
        user_id: rental.user_id ? (rental.user_id._id || rental.user_id) : req.user._id,
        customer_id: rental.customer ? (rental.customer._id || rental.customer) : null,
        customer_nic: rental.customer_nic || (rental.customer ? rental.customer.nicOrPassport : ''),
        amount: parsedReturnPay,
        payment_type: 'Balance Settlement',
        payment_method: returnPaymentMethod || 'Cash',
        transaction_ref: `PAY-LE-RET-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        notes: returnPaymentNotes || `Payment collected upon equipment return settlement for bill ${rental.rentalCode}`,
        status: 'Successful',
        paid_at: new Date(),
      });

      rental.paidAmount = (rental.paidAmount || 0) + parsedReturnPay;
    }

    // Recalculate remaining balance due and payment status
    const currentPaid = rental.paidAmount || 0;
    const finalBalanceDue = Math.max(0, updatedTotalAmount - currentPaid);
    rental.balanceDue = finalBalanceDue;

    if (finalBalanceDue === 0) {
      rental.paymentStatus = 'Paid';
    } else if (currentPaid > 0) {
      rental.paymentStatus = 'Partially Paid';
    } else {
      rental.paymentStatus = 'Pending';
    }

    // Close and finalize the bill as Completed even if an outstanding balance remains
    rental.status = 'Completed';
    await rental.save();

    // Sync customer's total outstanding balance across all bills
    const syncRes = await syncCustomerOutstandingBalance(
      rental.customer ? (rental.customer._id || rental.customer) : null,
      rental.customer_nic
    );

    // Revert tool status & update current meter reading
    if (rental.tool) {
      const toolToUpdate = await Tool.findById(rental.tool._id);
      if (toolToUpdate) {
        toolToUpdate.status = newToolStatus || 'Available';
        if (newToolCondition) toolToUpdate.condition = newToolCondition;
        toolToUpdate.currentMeterReading = finalMeter;
        if (damageNotes) {
          toolToUpdate.maintenanceNotes = `Return inspection notes: ${damageNotes}`;
        }
        await toolToUpdate.save();
      }
    }

    res.json({
      success: true,
      data: rental,
      settlement: {
        depositCollected: rental.depositAmount,
        lateFee: calculatedLateFee,
        damageFee: parsedDamageFee,
        excessMeterFee,
        netRefundOrDue: netDepositRefund,
        depositStatus: rental.depositStatus,
        totalBill: updatedTotalAmount,
        totalPaid: currentPaid,
        balanceDue: finalBalanceDue,
        paymentStatus: rental.paymentStatus,
        customerOutstandingBalance: syncRes.outstandingBalance,
      },
      message: `Return completed and bill finalized! Total Paid: LKR ${currentPaid.toLocaleString()}, Remaining Balance: LKR ${finalBalanceDue.toLocaleString()} (Tracked under NIC: ${rental.customer_nic || 'N/A'})`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/rentals/:id/settle-balance
// @desc    Record a follow-up balance settlement payment towards an outstanding bill
router.post('/:id/settle-balance', protect, async (req, res) => {
  try {
    const { amount, paymentMethod, notes, transactionRef } = req.body;
    const payAmt = Number(amount);

    if (!payAmt || payAmt <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid payment amount greater than 0' });
    }

    const rental = await Rental.findById(req.params.id)
      .populate('tool')
      .populate('customer')
      .populate('user_id');

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental agreement not found' });
    }

    if (!rental.balanceDue || rental.balanceDue <= 0) {
      return res.status(400).json({ success: false, message: 'This rental agreement is already fully paid (Balance Due: LKR 0)' });
    }

    const actualPayAmt = Math.min(payAmt, rental.balanceDue);
    const newPaidAmount = (rental.paidAmount || 0) + actualPayAmt;
    const newBalanceDue = Math.max(0, rental.totalAmount - newPaidAmount);

    rental.paidAmount = newPaidAmount;
    rental.balanceDue = newBalanceDue;
    rental.paymentStatus = newBalanceDue === 0 ? 'Paid' : 'Partially Paid';
    await rental.save();

    const payment = await Payment.create({
      rental_id: rental._id,
      user_id: rental.user_id ? (rental.user_id._id || rental.user_id) : req.user._id,
      customer_id: rental.customer ? (rental.customer._id || rental.customer) : null,
      customer_nic: rental.customer_nic || (rental.customer ? rental.customer.nicOrPassport : ''),
      amount: actualPayAmt,
      payment_type: newBalanceDue === 0 ? 'Full Balance' : 'Balance Settlement',
      payment_method: paymentMethod || 'Cash',
      transaction_ref: transactionRef || `PAY-LE-SETTLE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      notes: notes || `Follow-up balance payment for bill ${rental.rentalCode}`,
      status: 'Successful',
      paid_at: new Date(),
    });

    const syncRes = await syncCustomerOutstandingBalance(
      rental.customer ? (rental.customer._id || rental.customer) : null,
      rental.customer_nic
    );

    res.json({
      success: true,
      message: `Payment of LKR ${actualPayAmt.toLocaleString()} recorded successfully! Remaining balance: LKR ${newBalanceDue.toLocaleString()}`,
      data: {
        rental,
        payment,
        customerOutstandingBalance: syncRes.outstandingBalance,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/rentals/:id/notify
// @desc    Trigger WhatsApp / SMS notification for a rental
router.post('/:id/notify', protect, async (req, res) => {
  try {
    const { eventType, customMessage } = req.body;
    const rental = await Rental.findById(req.params.id)
      .populate('customer')
      .populate('user_id')
      .populate('tool');

    if (!rental) return res.status(404).json({ success: false, message: 'Rental not found' });

    const alertResult = await NotificationService.sendAlert(rental, eventType || 'Return Reminder', customMessage);
    rental.notificationsSent.push(alertResult);
    await rental.save();

    res.json({
      success: true,
      message: `WhatsApp/SMS ${eventType || 'Alert'} dispatched successfully!`,
      data: alertResult,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   PATCH /api/rentals/:id/extend
// @desc    Extend due date and recalculate rent
router.patch('/:id/extend', protect, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('tool')
      .populate('customer')
      .populate('user_id');

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental agreement not found' });
    }

    if (rental.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Cannot extend a completed agreement' });
    }

    const { newDueDate, notes } = req.body;
    if (!newDueDate) {
      return res.status(400).json({ success: false, message: 'newDueDate is required' });
    }

    const currentDue = new Date(rental.dueDate);
    const extendedDue = new Date(newDueDate);

    if (extendedDue <= currentDue) {
      return res.status(400).json({ success: false, message: 'New due date must be after current due date' });
    }

    const diffTime = extendedDue.getTime() - currentDue.getTime();
    const extraDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const dailyRate = rental.tool ? rental.tool.dailyRate : 0;
    const additionalRent = extraDays * dailyRate;

    rental.extendedDate = extendedDue;
    rental.dueDate = extendedDue;
    rental.rentAmount += additionalRent;
    rental.totalAmount += additionalRent;
    rental.status = 'Active';
    if (notes) rental.returnNotes = `${rental.returnNotes ? rental.returnNotes + ' | ' : ''}Extension: ${notes}`;

    await rental.save();

    res.json({
      success: true,
      data: rental,
      message: `Rental extended by ${extraDays} day(s). Additional rent: LKR ${additionalRent.toLocaleString()}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/rentals/:id/pdf
// @desc    Generate printable vector PDF Rental Agreement & Invoice
router.get('/:id/pdf', async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('customer')
      .populate('user_id')
      .populate('tool');

    if (!rental) {
      return res.status(404).send('Rental agreement not found');
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Lions_Rental_${rental.rentalCode}.pdf"`);

    doc.pipe(res);

    // Header Background Accent
    doc.rect(0, 0, 595.28, 85).fill('#0f172a');

    // Brand Title
    doc.fillColor('#f59e0b').fontSize(22).font('Helvetica-Bold').text('LIONS ENGINEERING', 40, 22);
    doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text('HEAVY MACHINERY, TOOL HIRE & FIELD ENGINEERING SERVICES', 40, 48);
    doc.text('Hotline: +94 11 234 5678 | Email: rentals@lionsengineering.lk | Web: lionsengineering.lk', 40, 60);

    // Document Type Banner
    doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text('EQUIPMENT LEASE AGREEMENT & INVOICE', 320, 25, { align: 'right' });
    doc.fillColor('#fbbf24').fontSize(11).text(rental.rentalCode, 320, 44, { align: 'right' });
    doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text(`Status: ${rental.status.toUpperCase()} | Deposit: ${rental.depositStatus.toUpperCase()}`, 320, 60, { align: 'right' });

    doc.moveDown(3);

    // Customer / User Details Box
    const clientName = rental.user_id ? rental.user_id.name : rental.customer ? rental.customer.name : 'Valued Client';
    const clientCompany = rental.user_id ? rental.user_id.company_name || 'Individual Contractor' : rental.customer ? rental.customer.companyName : 'N/A';
    const clientNic = rental.user_id ? rental.user_id.nic_or_passport : rental.customer ? rental.customer.nicOrPassport : 'N/A';
    const clientPhone = rental.user_id ? rental.user_id.phone_number : rental.customer ? rental.customer.phone : 'N/A';

    const metaY = 105;
    doc.rect(40, metaY, 515, 95).lineWidth(1).strokeColor('#e2e8f0').fillAndStroke('#f8fafc', '#cbd5e1');

    doc.fillColor('#1e293b').fontSize(11).font('Helvetica-Bold').text('LESSEE / CUSTOMER DETAILS', 55, metaY + 12);
    doc.font('Helvetica').fontSize(9).fillColor('#334155');
    doc.text(`Client Name: ${clientName}`, 55, metaY + 30);
    doc.text(`Company: ${clientCompany}`, 55, metaY + 44);
    doc.text(`NIC / Passport: ${clientNic}`, 55, metaY + 58);
    doc.text(`Phone: ${clientPhone}`, 55, metaY + 72);

    doc.fillColor('#1e293b').fontSize(11).font('Helvetica-Bold').text('AGREEMENT TIMELINE & LOGISTICS', 320, metaY + 12);
    doc.font('Helvetica').fontSize(9).fillColor('#334155');
    doc.text(`Start Date: ${new Date(rental.startDate).toLocaleDateString('en-GB')}`, 320, metaY + 30);
    doc.text(`Due Date: ${new Date(rental.dueDate).toLocaleDateString('en-GB')}`, 320, metaY + 44);
    doc.text(`Delivery Mode: ${rental.deliveryMode || 'Store Pickup'}`, 320, metaY + 58);
    doc.text(`Job Site: ${rental.siteLocation || 'Colombo Site'}`, 320, metaY + 72);

    // Equipment Details Section
    const toolY = 215;
    doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('EQUIPMENT SPECIFICATIONS & INSPECTION', 40, toolY);

    doc.rect(40, toolY + 18, 515, 24).fill('#1e293b');
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
    doc.text('ITEM DESCRIPTION', 50, toolY + 25);
    doc.text('ITEM CODE / SERIAL', 220, toolY + 25);
    doc.text('CATEGORY', 340, toolY + 25);
    doc.text('METER START', 440, toolY + 25);
    doc.text('RATE TIER', 500, toolY + 25);

    const rowY = toolY + 45;
    doc.rect(40, rowY, 515, 30).fill('#f1f5f9');
    doc.fillColor('#0f172a').font('Helvetica');
    doc.text(rental.tool ? rental.tool.name : 'Heavy Equipment', 50, rowY + 10, { width: 160 });
    doc.text(rental.tool ? rental.tool.serialNumber : 'N/A', 220, rowY + 10);
    doc.text(rental.tool ? rental.tool.category : 'General', 340, rowY + 10);
    doc.text(`${rental.startMeterReading || 0} Hrs`, 440, rowY + 10);
    doc.text(rental.rateTypeApplied || 'Daily', 500, rowY + 10);

    // Financial Breakdown Table
    const finY = 300;
    doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('FINANCIAL CHARGES & SETTLEMENT BREAKDOWN', 40, finY);

    const tblTop = finY + 18;
    doc.rect(40, tblTop, 515, 22).fill('#f59e0b');
    doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold');
    doc.text('CHARGE DESCRIPTION', 50, tblTop + 6);
    doc.text('AMOUNT (LKR)', 440, tblTop + 6, { align: 'right' });

    let currentY = tblTop + 26;
    const items = [
      { label: `Base Hire Charge (${rental.rateTypeApplied || 'Daily'} Rate Tier)`, val: rental.rentAmount },
      { label: 'Security Deposit (Refundable upon undamaged return)', val: rental.depositAmount },
      { label: `Transport & Logistics (${rental.deliveryMode || 'Store Pickup'})`, val: rental.deliveryFee || 0 },
    ];

    if (rental.excessMeterFee > 0) {
      items.push({ label: `Excess Meter Usage Fee (${rental.excessMeterHours} Hrs)`, val: rental.excessMeterFee });
    }
    if (rental.lateFee > 0) {
      items.push({ label: 'Late Overdue Return Penalty Charge', val: rental.lateFee });
    }
    if (rental.damageFee > 0) {
      items.push({ label: 'Equipment Repair / Damage Deduction', val: rental.damageFee });
    }

    items.forEach((item, idx) => {
      doc.rect(40, currentY, 515, 20).fill(idx % 2 === 0 ? '#ffffff' : '#f8fafc');
      doc.fillColor('#334155').font('Helvetica').fontSize(9);
      doc.text(item.label, 50, currentY + 5);
      doc.text(`LKR ${item.val.toLocaleString()}`, 400, currentY + 5, { width: 145, align: 'right' });
      currentY += 20;
    });

    // Financial Summary Totals Block
    doc.rect(40, currentY, 515, 62).fill('#0f172a');
    doc.fillColor('#94a3b8').font('Helvetica').fontSize(9);
    doc.text('TOTAL CONTRACT INVOICE VALUE:', 50, currentY + 8);
    doc.fillColor('#fbbf24').font('Helvetica-Bold').fontSize(10);
    doc.text(`LKR ${rental.totalAmount.toLocaleString()}`, 380, currentY + 8, { width: 165, align: 'right' });

    doc.fillColor('#94a3b8').font('Helvetica').fontSize(9);
    doc.text('TOTAL AMOUNT PAID TO DATE:', 50, currentY + 24);
    doc.fillColor('#10b981').font('Helvetica-Bold').fontSize(10);
    doc.text(`LKR ${(rental.paidAmount || 0).toLocaleString()}`, 380, currentY + 24, { width: 165, align: 'right' });

    const balDue = rental.balanceDue !== undefined ? rental.balanceDue : Math.max(0, rental.totalAmount - (rental.paidAmount || 0));
    doc.fillColor('#94a3b8').font('Helvetica').fontSize(9);
    doc.text('OUTSTANDING DUE BALANCE:', 50, currentY + 40);
    if (balDue > 0) {
      doc.fillColor('#ef4444').font('Helvetica-Bold').fontSize(11);
      doc.text(`LKR ${balDue.toLocaleString()} (UNSETTLED DUE)`, 340, currentY + 40, { width: 205, align: 'right' });
    } else {
      doc.fillColor('#10b981').font('Helvetica-Bold').fontSize(11);
      doc.text('LKR 0 (PAID IN FULL)', 380, currentY + 40, { width: 165, align: 'right' });
    }

    currentY += 66;

    // Terms & Signatures
    const sigY = currentY + 15;
    doc.fillColor('#64748b').fontSize(8).font('Helvetica');
    doc.text('TERMS & CONDITIONS: The lessee agrees to operate equipment safely and return in clean condition. Any damage beyond fair wear & tear will be deducted from security deposit.', 40, sigY, { width: 515 });

    doc.rect(40, sigY + 35, 230, 65).lineWidth(0.5).strokeColor('#cbd5e1').stroke();
    doc.rect(325, sigY + 35, 230, 65).lineWidth(0.5).strokeColor('#cbd5e1').stroke();

    doc.fillColor('#1e293b').fontSize(8).font('Helvetica-Bold');
    doc.text('FOR LIONS ENGINEERING (AUTHORIZED OFFICER)', 50, sigY + 42);
    doc.text('LESSEE / CUSTOMER DIGITAL ACCEPTANCE', 335, sigY + 42);

    doc.fillColor('#059669').fontSize(8).font('Helvetica');
    doc.text('✓ Authenticated & Dispatched', 50, sigY + 75);

    if (rental.digitalSignature) {
      doc.fillColor('#2563eb').fontSize(8).text('✓ Digitally Signed & Accepted via Portal', 335, sigY + 75);
    } else {
      doc.fillColor('#64748b').text('Authorized Signatory Stamp / E-Sign', 335, sigY + 75);
    }

    doc.end();
  } catch (err) {
    res.status(500).send('Error generating PDF invoice: ' + err.message);
  }
});

module.exports = router;
