# 🚗 Rentkar - Booking & Partner Verification System

A full-stack booking management system built with Next.js, MongoDB, and Redis featuring real-time partner tracking, concurrent booking management, and document verification workflows.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://rentkar-assignment-jxi3.onrender.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.0-red)](https://redis.io/)

## 🎯 Overview

This project implements a robust booking and partner management system for Rentkar, focusing on:

- **Concurrency-safe partner assignment** - Prevents double-booking using Redis locks
- **Document review workflow** - Admin approval system with real-time status updates
- **GPS tracking with rate limiting** - Live partner location tracking (6 updates/min max)
- **Real-time updates** - Server-Sent Events (SSE) for live dashboard updates
- **Dockerized deployment** - One-command setup with Docker Compose

## 🚀 Live Demo

**URL:** [https://rentkar-assignment-jxi3.onrender.com/](https://rentkar-assignment-jxi3.onrender.com/)

**Admin Credentials:**
- Username: `admin`
- Password: `password`

## ✨ Features

### 1. Partner Assignment System
- **Smart assignment** based on location proximity and availability
- **Concurrency safety** using Redis distributed locks (SET NX EX)
- **Geospatial queries** for finding nearest available partners
- **Status tracking** - Only online partners are assigned

### 2. Document Review & Booking Confirmation
- **Exclusive locking** - Only one admin can review documents at a time
- **Multi-document support** - SELFIE, SIGNATURE, etc.
- **Approval workflow** - Bookings can only be confirmed when all docs are APPROVED
- **Double-confirmation prevention** - Redis locks prevent race conditions

### 3. GPS Tracking
- **Real-time location updates** from partners
- **Rate limiting** - Maximum 6 GPS updates per minute per partner (Redis counters)
- **Location history** stored in MongoDB
- **Live dashboard** for tracking partner movements (coming soon)

### 4. Real-time Updates
- **Server-Sent Events (SSE)** for instant dashboard updates
- **Redis Pub/Sub** for event broadcasting
- **Events**: `booking:confirmed`, `partner:assigned`, `gps:updated`

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** (App Router + TypeScript)
- **Tailwind CSS** for styling
- **NextAuth.js** for authentication
- **Server-Sent Events** for real-time updates

### Backend
- **Next.js API Routes** (TypeScript)
- **MongoDB** with geospatial indexing
- **Redis** for locks, rate limiting, and pub/sub
- **Mongoose** for ODM

### Infrastructure
- **Docker Compose** for local development
- **Render** for production deployment
- **Upstash Redis** for production Redis

## 📁 Project Structure

```
rentkar/
├── components/           # React components
│   ├── ApproveDocumentsForm.tsx
│   ├── AssignPartnerForm.tsx
│   ├── BookingList.tsx
│   ├── ConfirmBookingForm.tsx
│   ├── Dashboard.tsx
│   ├── LiveGpsTable.tsx
│   ├── PartnerMap.tsx
│   └── PartnerSelector.tsx
├── hooks/               # Custom React hooks
│   ├── useLivePartnerLocations.ts
│   ├── usePartners.ts
│   └── useSSE.ts
├── lib/                 # Utilities & configs
│   ├── models/
│   │   ├── Booking.ts              # Booking model/schema
│   │   └── Partner.ts              # Partner model/schema
│   ├── api.ts                      # API utility functions
│   ├── mockData.ts                 # Mock/seed data
│   ├── mongodb.ts                  # MongoDB connection
│   └── redis.ts                    # Redis client setup
├── pages/
│   ├── api/            # API routes
│   │   ├── auth/
│   │   │   └── [...nextauth].ts   # NextAuth configuration
│   │   ├── bookings/
│   │   │   ├── [id]/
│   │   │   │   ├── documents/
│   │   │   │   │   ├── [docType].ts   # Review document
│   │   │   │   │   └── assign.ts      # Assign partner
│   │   │   │   └── confirm.ts         # Confirm booking
│   │   │   └── index.ts               # List bookings
│   │   ├── gps/
│   │   │   └── index.ts               # GPS data endpoint
│   │   ├── partners/
│   │   │   ├── [id]/
│   │   │   │   └── gps.ts            # Update GPS location
│   │   │   └── index.ts              # List partners
│   │   ├── seed.ts                   # Database seeder
│   │   ├── sse.ts                    # Server-Sent Events
│   │   └── ws.ts                     # WebSocket (future)
│   ├── auth/
│   │   └── signin.tsx                # Login page
│   ├── _app.tsx                      # App wrapper
│   └── index.tsx                     # Dashboard home
├── public/                           # Static assets
├── scripts/
│   └── seed.js                       # Database seeding script
├── styles/
│   └── global.css                    # Global styles
├── types/
│   ├── index.d.ts                    # Type definitions
│   ├── index.ts
│   └── next-auth.d.ts                # NextAuth types
├── .env.local                        # Environment variables
├── docker-compose.yml                # Docker services
├── Dockerfile                        # Container definition
├── next.config.js                    # Next.js config
├── package.json
└── tsconfig.json
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- Git

### Local Development (with Docker)

1. **Clone the repository**
```bash
git clone https://github.com/Xirzs/Rentkar-assignment.git
cd Rentkar-assignment
```

2. **Create environment file**
```bash
cp .env.example .env.local
```

Update `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/rentkar
MONGODB_DB=rentkar
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

3. **Start services with Docker Compose**
```bash
docker-compose up -d
```

This will start:
- Next.js app on `http://localhost:3000`
- MongoDB on `localhost:27017`
- Redis on `localhost:6379`

4. **Install dependencies** (if running outside Docker)
```bash
npm install
```

5. **Seed the database**
```bash
npm run seed
```

This will populate MongoDB with:
- Sample bookings (2-3 test bookings)
- Sample partners in different locations
- Geospatial indexes for location queries

6. **Access the application**
```
http://localhost:3000
```

Login with:
- Username: `admin`
- Password: `password`

### Local Development (without Docker)

If you prefer to run services locally:

1. **Install MongoDB and Redis** on your machine

2. **Start services**
```bash
# Terminal 1 - MongoDB
mongod

# Terminal 2 - Redis
redis-server

# Terminal 3 - Next.js
npm run dev
```

3. **Seed database**
```bash
npm run seed
```

## 📡 API Documentation

### Authentication
```
POST /api/auth/signin       # Sign in
POST /api/auth/signout      # Sign out
GET  /api/auth/session      # Get current session
```

### Bookings
```
GET  /api/bookings                              # List all bookings
POST /api/bookings/[id]/documents/assign        # Assign partner to booking
POST /api/bookings/[id]/documents/[docType]     # Review/approve document
POST /api/bookings/[id]/confirm                 # Confirm booking
```

### Partners
```
GET  /api/partners              # List all partners
POST /api/partners/[id]/gps     # Update partner GPS location
```

### Real-time
```
GET /api/sse                    # Server-Sent Events stream
GET /api/gps                    # Get all GPS locations
```

### Utilities
```
POST /api/seed                  # Seed database (dev only)
```

## 🔒 Concurrency & Safety Implementation

### 1. Partner Assignment
**Problem:** Multiple admins might assign the same partner simultaneously.

**Solution:**
```typescript
// Redis distributed lock
const lockKey = `lock:booking:${bookingId}`;
const acquired = await redis.set(lockKey, 'locked', 'NX', 'EX', 10);

if (!acquired) {
  return res.status(409).json({ error: 'Booking is being processed' });
}

// Assign partner...
await redis.del(lockKey);
```

### 2. Document Review
**Problem:** Two admins reviewing the same document.

**Solution:**
- Redis lock per booking: `lock:booking:review:{bookingId}`
- Lock expires after 60 seconds
- Only one admin can hold the lock

### 3. Booking Confirmation
**Problem:** Double confirmation race condition.

**Solution:**
- Check all documents are APPROVED
- Acquire Redis lock before confirmation
- Atomically update booking status
- Publish `booking:confirmed` event

### 4. GPS Rate Limiting
**Problem:** Partners spamming GPS updates.

**Solution:**
```typescript
// Redis counter with sliding window
const key = `gps:ratelimit:${partnerId}`;
const count = await redis.incr(key);

if (count === 1) {
  await redis.expire(key, 60); // 60 seconds window
}

if (count > 6) {
  return res.status(429).json({ error: 'Rate limit exceeded' });
}
```

## 🗄️ Database Schema

### Bookings Collection
```javascript
{
  "_id": ObjectId,
  "userId": ObjectId,
  "packageId": ObjectId,
  "partnerId": ObjectId,          // Assigned partner
  "startDate": Date,
  "endDate": Date,
  "isSelfPickup": Boolean,
  "location": String,
  "deliveryTime": {
    "startHour": Number,
    "endHour": Number
  },
  "selectedPlan": {
    "duration": Number,
    "price": Number
  },
  "priceBreakDown": {
    "basePrice": Number,
    "deliveryCharge": Number,
    "grandTotal": Number
  },
  "document": [{
    "docType": String,            // SELFIE, SIGNATURE, etc.
    "docLink": String,
    "status": String              // PENDING, APPROVED, REJECTED
  }],
  "address": {
    "buildingAreaName": String,
    "houseNumber": String,
    "streetAddress": String,
    "zip": String,
    "latitude": Number,
    "longitude": Number
  },
  "status": String,               // PENDING, CONFIRMED, CANCELLED
  "confirmedAt": Date
}
```

### Partners Collection
```javascript
{
  "_id": ObjectId,
  "name": String,
  "city": String,
  "status": String,               // online, offline
  "location": {
    "type": "Point",
    "coordinates": [lng, lat]     // GeoJSON format
  },
  "lastGpsUpdate": Date
}

// Geospatial index for proximity queries
db.partners.createIndex({ "location": "2dsphere" })
```

## 🎨 UI Features

### Dashboard
- **Booking list** with real-time status updates
- **Partner assignment** interface
- **Document review** panel
- **Confirmation workflow**

### Real-time Updates
- Auto-refreshing booking status
- Live GPS tracking table (coming soon)
- SSE connection status indicator

### Responsive Design
- Mobile-friendly Tailwind UI
- Dark mode support
- Accessible forms and modals

## 🧪 Testing the System

### 1. Test Partner Assignment
```bash
# Create a booking
curl -X POST http://localhost:3000/api/bookings/[id]/documents/assign \
  -H "Content-Type: application/json" \
  -d '{"partnerId": "partner123"}'
```

### 2. Test Document Review
```bash
# Approve a document
curl -X POST http://localhost:3000/api/bookings/[id]/documents/SELFIE \
  -H "Content-Type: application/json" \
  -d '{"status": "APPROVED"}'
```

### 3. Test GPS Rate Limiting
```bash
# Send 7 GPS updates rapidly (7th should fail)
for i in {1..7}; do
  curl -X POST http://localhost:3000/api/partners/partner123/gps \
    -H "Content-Type: application/json" \
    -d '{"lat": 19.20, "lng": 72.82}'
done
```

### 4. Test Concurrency
Open two browser tabs and try to:
- Assign a partner to the same booking simultaneously
- Confirm the same booking at the same time
→ Only one should succeed

## 🐛 Known Issues & Future Improvements

### Current Limitations
- **Live GPS tracking UI** - Under development (API works, UI pending)
- **WebSocket support** - Currently using SSE (WS implementation ready but not active)
- **Partner availability logic** - Basic implementation (can be enhanced)

### Future Enhancements
- [ ] Advanced partner matching algorithm (workload balancing)
- [ ] Historical GPS tracking with playback
- [ ] Push notifications for partners
- [ ] Mobile app for partner GPS updates
- [ ] Analytics dashboard
- [ ] Multi-city support with geo-sharding

## 🚢 Deployment

### Production Environment Variables
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/rentkar
MONGODB_DB=rentkar
REDIS_URL=redis://upstash.io:port
UPSTASH_REDIS_URL=https://your-instance.upstash.io
UPSTASH_REDIS_TOKEN=your-token
NEXTAUTH_URL=https://your-app.com
NEXTAUTH_SECRET=strong-random-secret
NODE_ENV=production
```

### Deploy to Render
1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Deploy automatically on push to `main`

### Docker Production Build
```bash
docker build -t rentkar-app .
docker run -p 3000:3000 --env-file .env.local rentkar-app
```

## 📊 Performance Considerations

- **Redis connection pooling** for high concurrency
- **MongoDB indexes** on frequently queried fields
- **Geospatial queries** optimized with 2dsphere index
- **SSE connection limits** handled with connection pooling
- **Rate limiting** prevents resource exhaustion

## 🤝 Contributing

This is a technical assessment project. For production use, consider:
- Adding comprehensive test suites
- Implementing CI/CD pipelines
- Setting up monitoring (Sentry, DataDog)
- Adding rate limiting on all endpoints
- Implementing proper RBAC

## 📄 License

MIT License - Feel free to use this for learning purposes.

## 👤 Author

**Niraj Mali**
- GitHub: [@Xirzs](https://github.com/Xirzs)
- Repository: [Rentkar-assignment](https://github.com/Xirzs/Rentkar-assignment)
- Assignment: Rentkar Developer Test

## 🙏 Acknowledgments

- **Rentkar** for the interesting technical challenge
- **Next.js** for the amazing framework
- **Redis** for making distributed systems easier
- **MongoDB** for flexible document storage

---

**Note:** This project was built as part of a technical assessment focusing on concurrency safety, real-time updates, and distributed systems design.

For questions or issues, please open a GitHub issue or contact the author.
