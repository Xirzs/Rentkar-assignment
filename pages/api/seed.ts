// pages/api/seed.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getDatabase } from "@/lib/mongodb"; // ✅ import helper
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const db = await getDatabase();

    // ✅ Sample bookings
    const bookings = [
      {
        userId: new ObjectId("68108f18d1224f8f22316a7b"),
        packageId: new ObjectId("685612cd3225791ecbb86b6e"),
        startDate: new Date("2025-07-19T00:00:00.000Z"),
        endDate: new Date("2025-07-20T00:00:00.000Z"),
        isSelfPickup: false,
        location: "mumbai",
        deliveryTime: { startHour: 12, endHour: 14 },
        selectedPlan: { duration: 1, price: 590 },
        priceBreakDown: { basePrice: 590, deliveryCharge: 250, grandTotal: 1580.02 },
        document: [
          {
            docType: "SELFIE",
            docLink: "https://rentkar-testv1.s3.ap-south-1.amazonaws.com/user/selfie/sample.jpg",
            status: "PENDING",
          },
          {
            docType: "SIGNATURE",
            docLink: "https://rentkar-testv1.s3.ap-south-1.amazonaws.com/user/signature/sample.jpg",
            status: "PENDING",
          },
        ],
        address: {
          buildingAreaName: "Pooja Enclave",
          houseNumber: "A/603",
          streetAddress: "Kandivali West, Mumbai",
          zip: "400067",
          latitude: 19.203258,
          longitude: 72.8278919,
        },
      },
      {
        userId: new ObjectId("68108f18d1224f8f22316a7c"),
        packageId: new ObjectId("685612cd3225791ecbb86b6f"),
        startDate: new Date("2025-07-21T00:00:00.000Z"),
        endDate: new Date("2025-07-22T00:00:00.000Z"),
        isSelfPickup: true,
        location: "delhi",
        deliveryTime: { startHour: 10, endHour: 12 },
        selectedPlan: { duration: 2, price: 1200 },
        priceBreakDown: { basePrice: 1200, deliveryCharge: 200, grandTotal: 1400 },
        document: [
          {
            docType: "SELFIE",
            docLink: "https://rentkar-testv1.s3.ap-south-1.amazonaws.com/user/selfie/sample2.jpg",
            status: "APPROVED",
          },
          {
            docType: "SIGNATURE",
            docLink: "https://rentkar-testv1.s3.ap-south-1.amazonaws.com/user/signature/sample2.jpg",
            status: "PENDING",
          },
        ],
        address: {
          buildingAreaName: "Green Park",
          houseNumber: "B/101",
          streetAddress: "South Delhi",
          zip: "110016",
          latitude: 28.5535,
          longitude: 77.2334,
        },
      },
      {
        userId: new ObjectId("68108f18d1224f8f22316a7d"),
        packageId: new ObjectId("685612cd3225791ecbb86b6a"),
        startDate: new Date("2025-07-23T00:00:00.000Z"),
        endDate: new Date("2025-07-24T00:00:00.000Z"),
        isSelfPickup: false,
        location: "bangalore",
        deliveryTime: { startHour: 14, endHour: 16 },
        selectedPlan: { duration: 3, price: 1800 },
        priceBreakDown: { basePrice: 1800, deliveryCharge: 300, grandTotal: 2100 },
        document: [
          {
            docType: "SELFIE",
            docLink: "https://rentkar-testv1.s3.ap-south-1.amazonaws.com/user/selfie/sample3.jpg",
            status: "APPROVED",
          },
          {
            docType: "SIGNATURE",
            docLink: "https://rentkar-testv1.s3.ap-south-1.amazonaws.com/user/signature/sample3.jpg",
            status: "APPROVED",
          },
        ],
        address: {
          buildingAreaName: "Indiranagar",
          houseNumber: "C/202",
          streetAddress: "Bangalore East",
          zip: "560038",
          latitude: 12.9716,
          longitude: 77.5946,
        },
      },
    ];

    // ✅ Sample partners
    const partners = [
      {
        name: "Test Partner",
        city: "mumbai",
        status: "online",
        location: { lat: 19.2, lng: 72.82 },
      },
      {
        name: "Delhi Partner",
        city: "delhi",
        status: "online",
        location: { lat: 28.55, lng: 77.23 },
      },
      {
        name: "Bangalore Partner",
        city: "bangalore",
        status: "offline",
        location: { lat: 12.97, lng: 77.59 },
      },
    ];

    // ✅ Clear old data & insert
    await db.collection("bookings").deleteMany({});
    await db.collection("partners").deleteMany({});

    await db.collection("bookings").insertMany(bookings);
    await db.collection("partners").insertMany(partners);

    return res.status(200).json({
      success: true,
      bookings: bookings.length,
      partners: partners.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Seed failed:", message);
    return res.status(500).json({ error: message });
  }
}
