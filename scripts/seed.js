const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'rentkar';

async function seedDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    
    // Clear existing data
    await db.collection('bookings').deleteMany({});
    await db.collection('partners').deleteMany({});
    
    // Seed partners
    const partners = [
      {
        _id: new ObjectId(),
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        phone: '+91-9876543210',
        status: 'online',
        location: {
          lat: 19.2183,
          lng: 72.9781,
          lastUpdated: new Date()
        },
        vehicleInfo: {
          type: 'Car',
          model: 'Maruti Swift',
          number: 'MH-01-AB-1234',
          capacity: 4
        },
        rating: 4.5,
        completedBookings: 150,
        createdAt: new Date(),
        lastActiveAt: new Date()
      },
      // Add more partners...
    ];
    
    await db.collection('partners').insertMany(partners);
    
    // Seed bookings
    const bookings = [
      {
        _id: new ObjectId(),
        userId: 'user_123',
        location: 'Mumbai, Maharashtra',
        address: '123 Marine Drive, Mumbai, MH 400001',
        status: 'PENDING',
        priceBreakDown: {
          basePrice: 1200,
          taxes: 200,
          fees: 100,
          grandTotal: 1500
        },
        document: [
          {
            _id: new ObjectId(),
            docType: 'License',
            status: 'PENDING',
            uploadedAt: new Date()
          },
          {
            _id: new ObjectId(),
            docType: 'Insurance',
            status: 'APPROVED',
            uploadedAt: new Date(),
            reviewedAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Add more bookings...
    ];
    
    await db.collection('bookings').insertMany(bookings);
    
    console.log('✅ Database seeded successfully!');
    console.log(`Inserted ${partners.length} partners`);
    console.log(`Inserted ${bookings.length} bookings`);
    
  } finally {
    await client.close();
  }
}

seedDatabase().catch(console.error);