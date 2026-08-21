const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/db');

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(morgan('dev'));

// Serve Static Frontend Assets from frontend/ folder
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tools', require('./routes/toolRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/rentals', require('./routes/rentalRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'Lions Engineering Tool Rental Platform',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🦁 Lions Engineering Rental Server running on port ${PORT}`);
  console.log(`👉 Access web dashboard at: http://localhost:${PORT}`);
});
