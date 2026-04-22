import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Province from '../models/Province.js';
import District from '../models/District.js';
import PoliceStation from '../models/PoliceStation.js';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import LocationPing from '../models/LocationPing.js';

dotenv.config();

const provinces = [
  { name: 'Western', code: 'WP' },
  { name: 'Central', code: 'CP' },
  { name: 'Southern', code: 'SP' },
  { name: 'Northern', code: 'NP' },
  { name: 'Eastern', code: 'EP' },
  { name: 'North Western', code: 'NWP' },
  { name: 'North Central', code: 'NCP' },
  { name: 'Uva', code: 'UP' },
  { name: 'Sabaragamuwa', code: 'SGP' },
];

const districtsByProvince = {
  WP:  [{ name: 'Colombo', code: 'COL' }, { name: 'Gampaha', code: 'GAM' }, { name: 'Kalutara', code: 'KAL' }],
  CP:  [{ name: 'Kandy', code: 'KAN' }, { name: 'Matale', code: 'MAT' }, { name: 'Nuwara Eliya', code: 'NUW' }],
  SP:  [{ name: 'Galle', code: 'GAL' }, { name: 'Matara', code: 'MTR' }, { name: 'Hambantota', code: 'HAM' }],
  NP:  [{ name: 'Jaffna', code: 'JAF' }, { name: 'Kilinochchi', code: 'KIL' }, { name: 'Mannar', code: 'MAN' }, { name: 'Vavuniya', code: 'VAV' }],
  EP:  [{ name: 'Trincomalee', code: 'TRI' }, { name: 'Batticaloa', code: 'BAT' }, { name: 'Ampara', code: 'AMP' }],
  NWP: [{ name: 'Kurunegala', code: 'KUR' }, { name: 'Puttalam', code: 'PUT' }],
  NCP: [{ name: 'Anuradhapura', code: 'ANU' }, { name: 'Polonnaruwa', code: 'POL' }],
  UP:  [{ name: 'Badulla', code: 'BAD' }, { name: 'Monaragala', code: 'MON' }],
  SGP: [{ name: 'Ratnapura', code: 'RAT' }, { name: 'Kegalle', code: 'KEG' }],
};

const stationNames = [
  'Colombo Fort', 'Wellawatte', 'Nugegoda', 'Kandy Central', 'Galle Fort',
  'Jaffna HQ', 'Trincomalee', 'Kurunegala', 'Anuradhapura', 'Badulla',
  'Gampaha', 'Kalutara', 'Matara', 'Hambantota', 'Batticaloa',
  'Ratnapura', 'Kegalle', 'Vavuniya', 'Ampara', 'Polonnaruwa',
  'Matale', 'Nuwara Eliya', 'Puttalam', 'Mannar', 'Monaragala',
];

// Sri Lanka bounding box for random coords
const randomCoord = () => ({
  latitude: 5.9 + Math.random() * 2.8,
  longitude: 79.7 + Math.random() * 1.8,
});

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    Province.deleteMany(),
    District.deleteMany(),
    PoliceStation.deleteMany(),
    User.deleteMany(),
    Vehicle.deleteMany(),
    LocationPing.deleteMany(),
  ]);
  console.log('🗑️  Cleared existing data');

  // Seed provinces
  const savedProvinces = await Province.insertMany(provinces);
  console.log(`✅ ${savedProvinces.length} provinces seeded`);

  // Seed districts
  const allDistricts = [];
  for (const prov of savedProvinces) {
    const dists = districtsByProvince[prov.code].map(d => ({
      ...d,
      province: prov._id,
    }));
    const saved = await District.insertMany(dists);
    allDistricts.push(...saved);
  }
  console.log(`✅ ${allDistricts.length} districts seeded`);

  // Seed police stations
  const stations = stationNames.map((name, i) => {
    const district = allDistricts[i % allDistricts.length];
    return {
      name,
      code: `STN${String(i + 1).padStart(3, '0')}`,
      district: district._id,
      province: district.province,
      address: `${name} Police Station, Sri Lanka`,
    };
  });
  const savedStations = await PoliceStation.insertMany(stations);
  console.log(`✅ ${savedStations.length} police stations seeded`);

  // Seed admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'HQ Administrator',
    username: 'admin',
    password: adminPassword,
    role: 'admin',
    province: savedProvinces[0]._id,
  });
  console.log('✅ Admin user created (username: admin, password: admin123)');

  // Seed officer user
  const officerPassword = await bcrypt.hash('officer123', 10);
  await User.create({
    name: 'Station Officer',
    username: 'officer1',
    password: officerPassword,
    role: 'officer',
    station: savedStations[0]._id,
    district: allDistricts[0]._id,
    province: savedProvinces[0]._id,
  });
  console.log('✅ Officer user created (username: officer1, password: officer123)');

  // Seed 200 tuk-tuks + device users
  const vehicles = [];
  for (let i = 1; i <= 200; i++) {
    const district = randomItem(allDistricts);
    const province = savedProvinces.find(p => p._id.equals(district.province));

    // Create device user for each tuk-tuk
    const devPassword = await bcrypt.hash(`device${i}`, 10);
    const deviceUser = await User.create({
      name: `Device ${i}`,
      username: `device${i}`,
      password: devPassword,
      role: 'device',
    });

    vehicles.push({
      registrationNumber: `WP-${String(i).padStart(4, '0')}`,
      driverName: `Driver ${i}`,
      driverNIC: `${String(i).padStart(9, '0')}V`,
      phone: `07${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      district: district._id,
      province: province._id,
      deviceUser: deviceUser._id,
      isActive: true,
    });
  }
  const savedVehicles = await Vehicle.insertMany(vehicles);
  console.log(`✅ ${savedVehicles.length} tuk-tuks seeded`);

  // Seed 1 week of location pings for each vehicle
  const now = new Date();
  const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const pings = [];

  for (const vehicle of savedVehicles) {
    // 1 ping every 30 minutes for 7 days = 336 pings per vehicle
    let current = new Date(oneWeekAgo);
    while (current <= now) {
      const { latitude, longitude } = randomCoord();
      pings.push({
        vehicle: vehicle._id,
        latitude,
        longitude,
        speed: Math.floor(Math.random() * 60),
        timestamp: new Date(current),
        district: vehicle.district,
        province: vehicle.province,
      });
      current = new Date(current.getTime() + 30 * 60 * 1000);
    }
  }

  // Insert in batches to avoid memory issues
  const batchSize = 5000;
  for (let i = 0; i < pings.length; i += batchSize) {
    await LocationPing.insertMany(pings.slice(i, i + batchSize));
    console.log(`📍 Inserted pings ${i + 1} to ${Math.min(i + batchSize, pings.length)}`);
  }

  console.log(`✅ Total pings seeded: ${pings.length}`);
  console.log('🎉 Seed complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed error:', err.message);
  process.exit(1);
});