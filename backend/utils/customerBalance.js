const Customer = require('../models/Customer');
const Rental = require('../models/Rental');

/**
 * Recalculates the customer's total outstanding balance across all their rental agreements
 * and syncs it to the Customer record.
 * 
 * @param {string|mongoose.Types.ObjectId} customerId - Customer document ID (optional)
 * @param {string} customerNic - Customer NIC/Passport string (optional)
 * @returns {Promise<number>} Updated outstanding balance
 */
async function syncCustomerOutstandingBalance(customerId, customerNic) {
  try {
    let queryConditions = [];

    if (customerId) {
      queryConditions.push({ customer: customerId });
      queryConditions.push({ user_id: customerId });
    }

    if (customerNic) {
      const cleanNic = customerNic.trim().toUpperCase();
      queryConditions.push({ customer_nic: cleanNic });
    }

    if (queryConditions.length === 0) return 0;

    // Find all rentals matching this customer/NIC
    const rentals = await Rental.find({ $or: queryConditions });

    // Sum all remaining due balances
    let totalOutstanding = 0;
    rentals.forEach((r) => {
      if (r.balanceDue && r.balanceDue > 0) {
        totalOutstanding += Number(r.balanceDue);
      }
    });

    // Update Customer record if customerId or customerNic matches
    let custQuery = {};
    if (customerId && customerNic) {
      custQuery = { $or: [{ _id: customerId }, { nicOrPassport: customerNic.trim().toUpperCase() }] };
    } else if (customerId) {
      custQuery = { _id: customerId };
    } else if (customerNic) {
      custQuery = { nicOrPassport: customerNic.trim().toUpperCase() };
    }

    const updatedCustomer = await Customer.findOneAndUpdate(
      custQuery,
      { $set: { outstandingBalance: Math.max(0, totalOutstanding) } },
      { new: true }
    );

    return {
      outstandingBalance: Math.max(0, totalOutstanding),
      customer: updatedCustomer,
      rentalCount: rentals.length,
    };
  } catch (err) {
    console.error('Error syncing customer balance:', err);
    return { outstandingBalance: 0, error: err.message };
  }
}

module.exports = {
  syncCustomerOutstandingBalance,
};
