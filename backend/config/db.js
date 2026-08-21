const dns = require('dns');
const mongoose = require('mongoose');

// Configure reliable DNS servers for SRV lookups on Windows/Cloud
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore in environments where setting custom DNS servers is restricted
}

// Ensure Node.js DNS resolver on Windows routes through public IPv4 DNS
const originalLookup = dns.lookup;
dns.lookup = function (hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  dns.resolve4(hostname, (err, addresses) => {
    if (!err && addresses && addresses.length > 0) {
      if (options && options.all) {
        return callback(null, addresses.map((a) => ({ address: a, family: 4 })));
      }
      return callback(null, addresses[0], 4);
    }
    originalLookup(hostname, options, callback);
  });
};

// Robust Mongoose Connection Pool Options for Continuous High-Availability
const mongooseOptions = {
  maxPoolSize: 25, // Maintain up to 25 socket connections in pool
  minPoolSize: 5, // Keep at least 5 active sockets ready at all times
  serverSelectionTimeoutMS: 10000, // 10s timeout for initial cluster selection
  socketTimeoutMS: 45000, // Close idle sockets after 45s of complete inactivity
  connectTimeoutMS: 15000, // 15s initial TCP handshake timeout
  heartbeatFrequencyMS: 10000, // Check cluster node health every 10 seconds
  family: 4, // Force IPv4 to prevent IPv6 lookup delays
  autoIndex: true,
};

let isConnecting = false;
let reconnectTimer = null;

// Attach Connection Lifecycle Event Listeners
function setupConnectionListeners() {
  mongoose.connection.on('connected', () => {
    console.log('🟢 [MongoDB Pool] Socket pool connected to cluster.');
  });

  mongoose.connection.on('open', () => {
    console.log(
      `✅ [MongoDB Atlas] Persistent connection active: ${mongoose.connection.host} / Database: ${mongoose.connection.name}`
    );
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ [MongoDB Pool Error]:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ [MongoDB Pool] Connection dropped or network changed. Triggering auto-reconnect...');
    if (!reconnectTimer && !isConnecting) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connectDB();
      }, 5000);
    }
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 [MongoDB Pool] Reconnected to MongoDB Atlas cluster successfully!');
  });
}

// Graceful process termination handlers
function setupProcessHandlers() {
  let isExiting = false;
  const gracefulExit = async (signal) => {
    if (isExiting) return;
    isExiting = true;
    try {
      console.log(`\n🛑 [MongoDB Pool] Process ${signal} received. Closing connection pool cleanly...`);
      await mongoose.connection.close(false);
      console.log('🔒 [MongoDB Pool] Connection pool closed gracefully.');
      process.exit(0);
    } catch (e) {
      process.exit(1);
    }
  };

  process.once('SIGINT', () => gracefulExit('SIGINT'));
  process.once('SIGTERM', () => gracefulExit('SIGTERM'));
}

// Initialize single persistent database connection
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    // Already connected (ReadyState: Connected)
    return mongoose.connection;
  }

  if (isConnecting) {
    return;
  }

  isConnecting = true;

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }

    const conn = await mongoose.connect(uri, mongooseOptions);
    isConnecting = false;
    return conn;
  } catch (error) {
    isConnecting = false;
    console.error(`❌ [MongoDB Atlas Connection Failed]: ${error.message}`);
    console.log('⏳ Retrying connection in 5 seconds...');
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connectDB();
      }, 5000);
    }
  }
};

// Initialize listeners once
setupConnectionListeners();
setupProcessHandlers();

module.exports = connectDB;
