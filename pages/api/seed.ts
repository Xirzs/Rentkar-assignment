// seed.js (root directory)
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'rentkar';

// Sample bookings with STATUS field
const mockBookings = [
  {
    _id: new ObjectId('687761e7c5bc4044c6d75cb3'),
    userId: '68108f18d1224f8f22316a7b',
    packageId: '685612cd3225791ecbb86b6e',
    location: 'mumbai',
    status: 'PENDING',
    selectedPlan: { duration: 1, price: 590 },
    document: [
      {
        _id: new ObjectId(),
        docType: 'SELFIE',
        docLink: 'https://example.com/selfie.jpg',
        status: 'PENDING'
      },
      {
        _id: new ObjectId(),
        docType: 'SIGNATURE',
        docLink: 'https://example.com/signature.jpg',
        status: 'PENDING'
      }
    ],
    address: {
      buildingAreaName: 'Pooja Enclave',
      houseNumber: 'A/603',
      streetAddress: 'Kandivali West, Mumbai',
      zip: '400067',
      latitude: 19.203258,
      longitude: 72.8278919
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId('68de10777de53f688afe1cb0'),
    userId: '68108f18d1224f8f22316a7e',
    packageId: '685612cd3225791ecbb86b71',
    location: 'delhi',
    status: 'PENDING',
    selectedPlan: { duration: 2, price: 1200 },
    document: [
      {
        _id: new ObjectId(),
        docType: 'SELFIE',
        docLink: 'https://example.com/selfie2.jpg',
        status: 'APPROVED'
      },
      {
        _id: new ObjectId(),
        docType: 'SIGNATURE',
        docLink: 'https://example.com/signature2.jpg',
        status: 'APPROVED'
      }
    ],
    address: {
      buildingAreaName: 'Green Park',
      houseNumber: 'B/101',
      streetAddress: 'South Delhi',
      zip: '110016',
      latitude: 28.5494,
      longitude: 77.2001
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId('68de10777de53f688afe1cb1'),
    userId: '68108f18d1224f8f22316a7f',
    packageId: '685612cd3225791ecbb86b72',
    location: 'delhi',
    status: 'PENDING',
    selectedPlan: { duration: 2, price: 1150 },
    document: [
      {
        _id: new ObjectId(),
        docType: 'SELFIE',
        docLink: 'https://example.com/selfie3.jpg',
        status: 'PENDING'
      },
      {
        _id: new ObjectId(),
        docType: 'SIGNATURE',
        docLink: 'https://example.com/signature3.jpg',
        status: 'PENDING'
      }
    ],
    address: {
      buildingAreaName: 'Saket',
      houseNumber: 'C/202',
      streetAddress: 'South Delhi',
      zip: '110017',
      latitude: 28.5244,
      longitude: 77.2066
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// FIXED: Partners now use MongoDB GeoJSON format
const mockPartners = [
  {
    _id: new ObjectId('68de10777de53f688afe1cb4'),
    name: 'Delhi Partner 1',
    email: 'partner1.delhi@rentkar.com',
    phone: '+91-9876543210',
    city: 'delhi',
    status: 'online',
    currentLocation: {
      type: 'Point',
      coordinates: [77.2001, 28.5494] // [longitude, latitude]
    },
    lastUpdated: new Date().toISOString(),
    lastActiveAt: new Date(),
    vehicleInfo: {
      type: 'Car',
      model: 'Maruti Swift',
      number: 'DL-01-AB-1234',
      capacity: 4
    },
    rating: 4.5,
    completedBookings: 150,
    createdAt: new Date()
  },
  {
    _id: new ObjectId('68de10777de53f688afe1cb5'),
    name: 'Delhi Partner 2',
    email: 'partner2.delhi@rentkar.com',
    phone: '+91-9876543211',
    city: 'delhi',
    status: 'online',
    currentLocation: {
      type: 'Point',
      coordinates: [77.2066, 28.5244] // [longitude, latitude]
    },
    lastUpdated: new Date().toISOString(),
    lastActiveAt: new Date(),
    vehicleInfo: {
      type: 'Car',
      model: 'Honda City',
      number: 'DL-02-CD-5678',
      capacity: 4
    },
    rating: 4.7,
    completedBookings: 200,
    createdAt: new Date()
  },
  {
    _id: new ObjectId('687761e7c5bc4044c6d75cb6'),
    name: 'Mumbai Partner 1',
    email: 'partner1.mumbai@rentkar.com',
    phone: '+91-9876543212',
    city: 'mumbai',
    status: 'online',
    currentLocation: {
      type: 'Point',
      coordinates: [72.8278919, 19.203258] // [longitude, latitude]
    },
    lastUpdated: new Date().toISOString(),
    lastActiveAt: new Date(),
    vehicleInfo: {
      type: 'Car',
      model: 'Hyundai Creta',
      number: 'MH-01-EF-9012',
      capacity: 5
    },
    rating: 4.6,
    completedBookings: 180,
    createdAt: new Date()
  },
  {
    _id: new ObjectId('687761e7c5bc4044c6d75cb7'),
    name: 'Mumbai Partner 2',
    email: 'partner2.mumbai@rentkar.com',
    phone: '+91-9876543213',
    city: 'mumbai',
    status: 'busy',
    currentLocation: {
      type: 'Point',
      coordinates: [72.869934, 19.113522] // [longitude, latitude]
    },
    lastUpdated: new Date().toISOString(),
    lastActiveAt: new Date(),
    vehicleInfo: {
      type: 'Car',
      model: 'Toyota Innova',
      number: 'MH-02-GH-3456',
      capacity: 7
    },
    rating: 4.8,
    completedBookings: 250,
    createdAt: new Date()
  }
];

async function seedDatabase() {
  const client = new MongoClient(uri);
  
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', uri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Clear existing data
    console.log('Clearing existing data...');
    await db.collection('bookings').deleteMany({});
    await db.collection('partners').deleteMany({});
    console.log('Existing data cleared');
    
    // Insert partners
    console.log('Inserting partners...');
    await db.collection('partners').insertMany(mockPartners);
    console.log(`Inserted ${mockPartners.length} partners`);
    
    // Insert bookings
    console.log('Inserting bookings...');
    await db.collection('bookings').insertMany(mockBookings);
    console.log(`Inserted ${mockBookings.length} bookings`);
    
    // Create indexes
    console.log('Creating indexes...');
    await db.collection('bookings').createIndex({ status: 1 });
    await db.collection('bookings').createIndex({ createdAt: -1 });
    await db.collection('bookings').createIndex({ partnerId: 1 });
    await db.collection('partners').createIndex({ status: 1 });
    await db.collection('partners').createIndex({ city: 1 });
    // GeoJSON index for location queries
    await db.collection('partners').createIndex({ currentLocation: '2dsphere' });
    console.log('Indexes created');
    
    console.log('\nDatabase seeded successfully!');
    console.log(`Partners: ${mockPartners.length}`);
    console.log(`  - Online: ${mockPartners.filter(p => p.status === 'online').length}`);
    console.log(`  - Busy: ${mockPartners.filter(p => p.status === 'busy').length}`);
    console.log(`  - Offline: ${mockPartners.filter(p => p.status === 'offline').length}`);
    console.log(`Bookings: ${mockBookings.length}`);
    console.log(`  - Pending: ${mockBookings.filter(b => b.status === 'PENDING').length}`);
    console.log(`  - Assigned: ${mockBookings.filter(b => b.status === 'ASSIGNED').length}`);
    console.log(`  - Confirmed: ${mockBookings.filter(b => b.status === 'CONFIRMED').length}`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase().catch(console.error);