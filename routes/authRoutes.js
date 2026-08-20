const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, requireRole, JWT_SECRET } = require('../middleware/authMiddleware');

function generateToken(id) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
}

// @route   POST /api/auth/register
// @desc    Register a new customer or admin
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone_number, nic_or_passport, company_name, address } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: role === 'admin' ? 'admin' : 'customer',
      phone_number: phone_number || '+94 77 000 0000',
      nic_or_passport: nic_or_passport ? nic_or_passport.toUpperCase() : 'PENDING_NIC',
      company_name: company_name || '',
      address: address || 'Colombo, Sri Lanka',
      verification_status: role === 'admin' ? 'Verified' : 'Pending',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone_number: user.phone_number,
        nic_or_passport: user.nic_or_passport,
        company_name: user.company_name,
        address: user.address,
        verification_status: user.verification_status,
      },
      message: 'Account registered successfully!',
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone_number: user.phone_number,
        nic_or_passport: user.nic_or_passport,
        company_name: user.company_name,
        address: user.address,
        verification_status: user.verification_status,
      },
      message: `Logged in successfully as ${user.role}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// @route   PATCH /api/auth/profile
// @desc    Update current contractor's profile details
router.patch('/profile', protect, async (req, res) => {
  try {
    const { name, phone_number, company_name, address } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name.trim();
    if (phone_number) user.phone_number = phone_number.trim();
    if (company_name !== undefined) user.company_name = company_name.trim();
    if (address) user.address = address.trim();

    await user.save();

    res.json({
      success: true,
      message: 'Profile details updated successfully!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone_number: user.phone_number,
        nic_or_passport: user.nic_or_passport,
        company_name: user.company_name,
        address: user.address,
        verification_status: user.verification_status,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/auth/reupload-kyc
// @desc    Re-upload KYC verification documents
router.post('/reupload-kyc', protect, async (req, res) => {
  try {
    const { documentType, documentData } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.kyc_document_url = documentData || `https://lionsengineering.lk/docs/kyc_${user._id}.jpg`;
    user.verification_status = 'Under Review';
    await user.save();

    res.json({
      success: true,
      message: 'KYC documents uploaded successfully! Account status is now Under Review.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone_number: user.phone_number,
        nic_or_passport: user.nic_or_passport,
        company_name: user.company_name,
        address: user.address,
        verification_status: user.verification_status,
        kyc_document_url: user.kyc_document_url,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/auth/users
// @desc    Get all users (Admin only)
router.get('/users', protect, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   PATCH /api/auth/users/:id/verify
// @desc    Update user KYC verification status (Admin only)
router.patch('/users/:id/verify', protect, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.verification_status = status || 'Verified';
    await user.save();

    res.json({ success: true, message: `User verification status updated to ${user.verification_status}`, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Verify user identity for password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, nic_or_passport } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide registered email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered account found with this email address' });
    }

    // Optional NIC match verification
    if (nic_or_passport && user.nic_or_passport && user.nic_or_passport !== 'PENDING_NIC') {
      if (user.nic_or_passport.toUpperCase() !== nic_or_passport.toUpperCase().trim()) {
        return res.status(400).json({ success: false, message: 'Provided NIC / Passport does not match records for this account' });
      }
    }

    // Generate simulated 6-digit OTP code
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();

    res.json({
      success: true,
      message: `Verification code generated for ${user.email}. Please enter your new password to proceed.`,
      userName: user.name,
      email: user.email,
      otpHint: mockOtp,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset user password with new credentials
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Your password has been successfully reset! You can now log in with your new credentials.',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

