const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tool = require('./models/Tool');

dotenv.config();

const toolsToSeed = [
  {
    name: 'Bosch Cordless Impact Drill 18V',
    category: 'Power Tools',
    serialNumber: 'LE-PWR-009',
    dailyRate: 1800,
    weeklyRate: 9800,
    monthlyRate: 35000,
    depositAmount: 6000,
    status: 'Available',
    condition: 'Excellent',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'DeWalt Precision Circular Saw 1800W',
    category: 'Power Tools',
    serialNumber: 'LE-PWR-010',
    dailyRate: 2000,
    weeklyRate: 11000,
    monthlyRate: 39000,
    depositAmount: 7000,
    status: 'Available',
    condition: 'Excellent',
    imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Karcher High Pressure Washer K5',
    category: 'Cleaning Equipment',
    serialNumber: 'LE-CLN-011',
    dailyRate: 2500,
    weeklyRate: 13500,
    monthlyRate: 48000,
    depositAmount: 8500,
    status: 'Available',
    condition: 'Excellent',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Makita Angle Grinder 840W Heavy Duty',
    category: 'Power Tools',
    serialNumber: 'LE-PWR-012',
    dailyRate: 1500,
    weeklyRate: 8000,
    monthlyRate: 29000,
    depositAmount: 5000,
    status: 'Available',
    condition: 'Good',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Industrial Mechanics Socket Set (46 Pcs)',
    category: 'Hand Tools',
    serialNumber: 'LE-HND-013',
    dailyRate: 1000,
    weeklyRate: 5500,
    monthlyRate: 19000,
    depositAmount: 4000,
    status: 'Available',
    condition: 'Excellent',
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Aluminum Extension Dual Ladder (16ft)',
    category: 'Access & Scaffolding',
    serialNumber: 'LE-ACC-014',
    dailyRate: 1200,
    weeklyRate: 6500,
    monthlyRate: 22000,
    depositAmount: 5000,
    status: 'Available',
    condition: 'Good',
    imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Industrial Wet & Dry Vacuum Cleaner 30L',
    category: 'Cleaning Equipment',
    serialNumber: 'LE-CLN-015',
    dailyRate: 1600,
    weeklyRate: 8800,
    monthlyRate: 31000,
    depositAmount: 6000,
    status: 'Available',
    condition: 'Excellent',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Heavy Breaker Demolition Hammer 2000W',
    category: 'Power Tools',
    serialNumber: 'LE-PWR-016',
    dailyRate: 3000,
    weeklyRate: 16000,
    monthlyRate: 58000,
    depositAmount: 10000,
    status: 'Available',
    condition: 'Excellent',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80',
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
  for (const t of toolsToSeed) {
    await Tool.findOneAndUpdate({ serialNumber: t.serialNumber }, t, { upsert: true, new: true });
    console.log(`Seeded / Updated tool: ${t.name} (${t.serialNumber})`);
  }
  console.log('All reference tools seeded successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
