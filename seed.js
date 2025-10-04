// scripts/seed.ts
import { MongoClient, ObjectId } from 'mongodb';
import { mockBookings, mockPartners } from '../lib/mockData';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'rentkar';

async function seedDatabase() {
  const client = new MongoClient(uri);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Clear existing dataa
    console.log('🗑️  Clearing existing data...');
    await db.collection('bookings').deleteMany({});
    await db.collection('partners').deleteMany({});
    console.log('✅ Existing data cleared');
    
    // Convert string IDs to ObjectIds for MongoDB
    const bookingsToInsert = mockBookings.map(booking => ({
      ...booking,
      _id: new ObjectId(booking._id),
      assignedPartner: booking.assignedPartner ? new ObjectId(booking.assignedPartner) : undefined,
      document: booking.document?.map(doc => ({
        ...doc,
        _id: new ObjectId(doc._id)
      }))
    }));

    const partnersToInsert = mockPartners.map(partner => ({
      ...partner,
      _id: new ObjectId(partner._id)
    }));
    
    // Insert partners
    console.log('👥 Inserting partners...');
    await db.collection('partners').insertMany(partnersToInsert);
    console.log(`✅ Inserted ${partnersToInsert.length} partners`);
    
    // Insert bookings
    console.log('📋 Inserting bookings...');
    await db.collection('bookings').insertMany(bookingsToInsert);
    console.log(`✅ Inserted ${bookingsToInsert.length} bookings`);
    
    // Create indexes for better performance
    console.log('📊 Creating indexes...');
    await db.collection('bookings').createIndex({ status: 1 });
    await db.collection('bookings').createIndex({ createdAt: -1 });
    await db.collection('bookings').createIndex({ assignedPartner: 1 });
    await db.collection('partners').createIndex({ status: 1 });
    await db.collection('partners').createIndex({ lastActiveAt: -1 });
    console.log('✅ Indexes created');
    
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Partners: ${partnersToInsert.length}`);
    console.log(`   - Online: ${partnersToInsert.filter(p => p.status === 'online').length}`);
    console.log(`   - Busy: ${partnersToInsert.filter(p => p.status === 'busy').length}`);
    console.log(`   - Offline: ${partnersToInsert.filter(p => p.status === 'offline').length}`);
    console.log(`\n   Bookings: ${bookingsToInsert.length}`);
    console.log(`   - Pending: ${bookingsToInsert.filter(b => b.status === 'PENDING').length}`);
    console.log(`   - Assigned: ${bookingsToInsert.filter(b => b.status === 'ASSIGNED').length}`);
    console.log(`   - Confirmed: ${bookingsToInsert.filter(b => b.status === 'CONFIRMED').length}`);
    
    const pendingDocs = bookingsToInsert.reduce((count, b) => 
      count + (b.document?.filter(d => d.status === 'PENDING').length || 0), 0
    );
    console.log(`\n   📄 Pending Documents: ${pendingDocs}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase().catch(console.error);