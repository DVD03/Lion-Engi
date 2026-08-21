const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const originalLookup = dns.lookup;
dns.lookup = function (hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  dns.resolve4(hostname, (err, addresses) => {
    if (!err && addresses && addresses.length > 0) {
      if (options && options.all) {
        return callback(null, addresses.map(a => ({ address: a, family: 4 })));
      }
      return callback(null, addresses[0], 4);
    }
    originalLookup(hostname, options, callback);
  });
};

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Tool = require('./models/Tool');
const Customer = require('./models/Customer');
const Rental = require('./models/Rental');
const Maintenance = require('./models/Maintenance');
const Payment = require('./models/Payment');

const sampleTools = [
  {
    name: 'Heavy Duty 200L Concrete Mixer',
    category: 'Concrete & Masonry',
    serialNumber: 'LE-CON-001',
    dailyRate: 3500,
    weeklyRate: 20000,
    monthlyRate: 75000,
    depositAmount: 15000,
    meterReadingLimit: 8,
    currentMeterReading: 142,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    status: 'Available',
    condition: 'Excellent',
    lastServicedDate: new Date(),
    nextServiceDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    maintenanceNotes: '500-hour overhaul completed; engine oil and belt replaced.',
  },
  {
    name: 'Bosch SDS-Max Demolition Hammer 1500W',
    category: 'Power Tools',
    serialNumber: 'LE-PWR-002',
    dailyRate: 2200,
    weeklyRate: 12000,
    monthlyRate: 45000,
    depositAmount: 8000,
    meterReadingLimit: 0,
    currentMeterReading: 0,
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80',
    status: 'Available',
    condition: 'Excellent',
    lastServicedDate: new Date(),
    nextServiceDue: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    maintenanceNotes: 'Carbon brushes checked; grease replenished.',
  },
  {
    name: 'Inverter TIG/ARC Welding Machine 250A',
    category: 'Welding & Cutting',
    serialNumber: 'LE-WLD-003',
    dailyRate: 2800,
    weeklyRate: 15500,
    monthlyRate: 58000,
    depositAmount: 12000,
    meterReadingLimit: 0,
    currentMeterReading: 0,
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
    status: 'Available',
    condition: 'Good',
    lastServicedDate: new Date(),
    nextServiceDue: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
    maintenanceNotes: 'Torch lead and earth clamp serviced.',
  },
  {
    name: 'Leica FlexLine Total Station TS07',
    category: 'Surveying & Measuring',
    serialNumber: 'LE-SRV-004',
    dailyRate: 6500,
    weeklyRate: 36000,
    monthlyRate: 135000,
    depositAmount: 35000,
    meterReadingLimit: 0,
    currentMeterReading: 0,
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
    status: 'Available',
    condition: 'Excellent',
    lastServicedDate: new Date(),
    nextServiceDue: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    maintenanceNotes: 'Optical calibration and laser distance validation certified.',
  },
  {
    name: 'Honda Silent Inverter Generator 7.5kVA',
    category: 'Generators & Power',
    serialNumber: 'LE-GEN-005',
    dailyRate: 4800,
    weeklyRate: 27000,
    monthlyRate: 98000,
    depositAmount: 20000,
    meterReadingLimit: 10,
    currentMeterReading: 310,
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&auto=format&fit=crop&q=80',
    status: 'Available',
    condition: 'Good',
    lastServicedDate: new Date(),
    nextServiceDue: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    maintenanceNotes: 'Carburetor cleaned and air filter washed.',
  },
  {
    name: 'Mobile Aluminum Scaffolding Tower (6M)',
    category: 'Access & Scaffolding',
    serialNumber: 'LE-ACC-006',
    dailyRate: 3200,
    weeklyRate: 18000,
    monthlyRate: 65000,
    depositAmount: 18000,
    meterReadingLimit: 0,
    currentMeterReading: 0,
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=600&auto=format&fit=crop&q=80',
    status: 'Available',
    condition: 'Good',
    lastServicedDate: new Date(),
    nextServiceDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    maintenanceNotes: 'Lockable castor wheels and outrigger clamps inspected.',
  },
  {
    name: 'Makita 9-Inch Industrial Angle Grinder',
    category: 'Power Tools',
    serialNumber: 'LE-PWR-007',
    dailyRate: 1500,
    weeklyRate: 8500,
    monthlyRate: 30000,
    depositAmount: 5000,
    meterReadingLimit: 0,
    currentMeterReading: 0,
    imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&auto=format&fit=crop&q=80',
    status: 'Under Maintenance',
    condition: 'Fair',
    lastServicedDate: new Date(),
    nextServiceDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    maintenanceNotes: 'Armature bearings inspection in progress.',
  },
  {
    name: 'Plate Compactor Wacker Neuson 90kg',
    category: 'Heavy Machinery',
    serialNumber: 'LE-HVY-008',
    dailyRate: 4200,
    weeklyRate: 24000,
    monthlyRate: 88000,
    depositAmount: 20000,
    meterReadingLimit: 8,
    currentMeterReading: 85,
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
    status: 'Available',
    condition: 'Good',
    lastServicedDate: new Date(),
    nextServiceDue: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    maintenanceNotes: 'Exciter oil renewed and base plate polished.',
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Connected to MongoDB Atlas for seeding...');

    try {
      await User.collection.drop();
      await Tool.collection.drop();
      await Customer.collection.drop();
      await Rental.collection.drop();
      await Maintenance.collection.drop();
      await Payment.collection.drop();
    } catch (e) {}
    console.log('Cleared existing collections.');

    // 1. Seed Users (Admin + Customers)
    const adminUser = await User.create({
      name: 'Lions System Administrator',
      email: 'admin@lions.lk',
      password: 'admin123',
      role: 'admin',
      phone_number: '+94 11 234 5678',
      nic_or_passport: '800010001V',
      verification_status: 'Verified',
      company_name: 'Lions Engineering HQ',
      address: 'No 100, High Level Road, Nugegoda',
    });

    const customerUser = await User.create({
      name: 'Kamal Perera',
      email: 'kamal@apex.lk',
      password: 'customer123',
      role: 'customer',
      phone_number: '+94 77 123 4567',
      nic_or_passport: '851234567V',
      verification_status: 'Verified',
      company_name: 'Apex Civil Engineering Ltd',
      address: 'No 45, Baseline Road, Colombo 09',
    });

    const customerUser2 = await User.create({
      name: 'Sunil Weerasinghe',
      email: 'sunil@lanka.lk',
      password: 'customer123',
      role: 'customer',
      phone_number: '+94 71 987 6543',
      nic_or_passport: '199023401928',
      verification_status: 'Pending',
      company_name: 'Lanka Foundations & Piling',
      address: '120 Galle Road, Kalutara',
    });

    console.log('✅ Seeded 3 Users:');
    console.log('   - Admin: admin@lions.lk / admin123');
    console.log('   - Customer: kamal@apex.lk / customer123');
    console.log('   - Customer: sunil@lanka.lk / customer123');

    // Also populate legacy Customer collection for backward compatibility
    await Customer.create({
      name: customerUser.name,
      companyName: customerUser.company_name,
      phone: customerUser.phone_number,
      nicOrPassport: customerUser.nic_or_passport,
      address: customerUser.address,
    });

    // 2. Seed Tools / Equipment
    const createdTools = await Tool.insertMany(sampleTools);
    console.log(`✅ Seeded ${createdTools.length} tools / equipment with tiered rates`);

    // 3. Create Sample Rental / Booking
    const rentalTool = createdTools[0]; // Concrete Mixer
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 4);

    const rentAmount = rentalTool.dailyRate * 4;
    const depositAmount = rentalTool.depositAmount;
    const deliveryFee = 3500;

    rentalTool.status = 'Rented';
    await rentalTool.save();

    const sampleRental = new Rental({
      rentalCode: 'LE-RENT-1001',
      user_id: customerUser._id,
      customer: customerUser._id,
      tool: rentalTool._id,
      startDate: today,
      dueDate: dueDate,
      rateTypeApplied: 'Daily',
      rentAmount: rentAmount,
      depositAmount: depositAmount,
      deliveryMode: 'Site Delivery',
      deliveryFee: deliveryFee,
      deliveryAddress: 'Colombo Port City Project Site #4',
      startMeterReading: 142,
      totalAmount: rentAmount + depositAmount + deliveryFee,
      lateFee: 0,
      damageFee: 0,
      damageNotes: '',
      status: 'Active',
      paymentStatus: 'Paid',
      depositStatus: 'Held',
      siteLocation: 'Colombo Port City Project Site #4',
      returnNotes: 'Dispatched with operator handbook',
      preDispatchPhotos: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600'],
      notificationsSent: [
        {
          channel: 'WhatsApp',
          type: 'Booking Confirmed',
          recipient: customerUser.phone_number,
          message: 'Booking confirmed for LE-RENT-1001',
          status: 'Delivered',
        },
      ],
    });

    await sampleRental.save();
    console.log('✅ Created active booking LE-RENT-1001');

    // 4. Create Initial Payment Record
    await Payment.create({
      rental_id: sampleRental._id,
      user_id: customerUser._id,
      amount: sampleRental.totalAmount,
      payment_type: 'Full Balance',
      payment_method: 'Gateway',
      transaction_ref: `PAY-LE-${Date.now()}-1001`,
      status: 'Successful',
      paid_at: new Date(),
    });
    console.log('✅ Created initial payment transaction record');

    // 5. Create Sample Maintenance Record
    const maintenanceTool = createdTools[6]; // Makita Grinder
    await Maintenance.create({
      tool: maintenanceTool._id,
      serviceDate: new Date(),
      cost: 4500,
      repairNotes: 'Armature bearing inspection and cable renewal.',
      technicianName: 'Sampath (Lions Chief Mechanic)',
      status: 'In Progress',
    });
    console.log('✅ Created sample maintenance record');

    console.log('\n🎉 Comprehensive database seeding completed into MongoDB Atlas!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
