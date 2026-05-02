import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Property, PropertyType } from '../types';

const SAMPLE_PROPERTIES: Partial<Property>[] = [
  {
    title: "Luxury 500 Sq Yards Villa in DHA Phase 6",
    price: 150000000,
    location: "Phase 6, DHA",
    area: "DHA Karachi",
    type: PropertyType.HOUSE,
    rooms: 5,
    bathrooms: 6,
    areaSize: "500 Sq Yards",
    description: "Architecturally designed modern villa with high-end finishes. Features double height lobby, basement, and rooftop garden.",
    imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800",
    status: "available",
  },
  {
    title: "3 Bed Apartment with Sea View in Clifton",
    price: 65000000,
    location: "Block 4, Clifton",
    area: "Clifton",
    type: PropertyType.APARTMENT,
    rooms: 3,
    bathrooms: 3,
    areaSize: "2200 Sq Feet",
    description: "Spacious apartment with stunning sea view from the balcony. Master bedroom with ensuite. 24/7 security and backup generator.",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800",
    status: "available",
  },
  {
    title: "Modern House in Bahria Town Phase 1",
    price: 45000000,
    location: "Precinct 1, Bahria Town",
    area: "Bahria Town Karachi",
    type: PropertyType.HOUSE,
    rooms: 4,
    bathrooms: 4,
    areaSize: "250 Sq Yards",
    description: "Brand new house in a secure gated community. Ideal for small families. Close to theme park and commercial area.",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
    status: "available",
  },
  {
    title: "Commercial Plot in Gulshan-e-Iqbal Block 13D",
    price: 120000000,
    location: "Block 13D, Gulshan-e-Iqbal",
    area: "Gulshan-e-Iqbal",
    type: PropertyType.PLOT,
    rooms: 0,
    bathrooms: 0,
    areaSize: "400 Sq Yards",
    description: "Prime location for commercial development. High visibility corner plot, ideal for office building or showroom.",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
    status: "available",
  },
  {
    title: "Executive Apartment in DHA Phase 8",
    price: 85000000,
    location: "Phase 8, DHA",
    area: "DHA Karachi",
    type: PropertyType.APARTMENT,
    rooms: 3,
    bathrooms: 4,
    areaSize: "2800 Sq Feet",
    description: "High-end luxury apartment in the most prestigious phase of DHA. Features Italian kitchen and smart home automation.",
    imageUrl: "https://images.unsplash.com/photo-1512918766755-ee75175f423b?auto=format&fit=crop&q=80&w=800",
    status: "available",
  },
  {
    title: "4-Bed Modern House in Gulshan Block 4",
    price: 55000000,
    location: "Block 4, Gulshan-e-Iqbal",
    area: "Gulshan-e-Iqbal",
    type: PropertyType.HOUSE,
    rooms: 4,
    bathrooms: 4,
    areaSize: "240 Sq Yards",
    description: "Well-maintained west-open house in the heart of Gulshan. Close to schools and main commercial markets.",
    imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=800",
    status: "available",
  },
  {
    title: "125 Sq Yards Plot in Bahria Precinct 12",
    price: 7500000,
    location: "Precinct 12, Bahria Town",
    area: "Bahria Town Karachi",
    type: PropertyType.PLOT,
    rooms: 0,
    bathrooms: 0,
    areaSize: "125 Sq Yards",
    description: "On-height plot with great view. Fully developed area with possession available. Perfect for investment.",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
    status: "available",
  },
  {
    title: "Penthouse at Emaar Oceanfront",
    price: 350000000,
    location: "DHA Phase 8 Extension",
    area: "DHA Karachi",
    type: PropertyType.APARTMENT,
    rooms: 4,
    bathrooms: 5,
    areaSize: "4500 Sq Feet",
    description: "Ultra-luxury waterfront living. Features panoramic sea views, private lift, and world-class amenities.",
    imageUrl: "https://images.unsplash.com/photo-1567496898731-f39b0d1b742c?auto=format&fit=crop&q=80&w=800",
    status: "available",
  }
];

export async function seedDatabase() {
  const propertiesRef = collection(db, 'properties');
  const snapshot = await getDocs(propertiesRef);
  
  if (snapshot.empty) {
    console.log("Seeding properties...");
    for (const data of SAMPLE_PROPERTIES) {
      const docRef = doc(propertiesRef);
      await setDoc(docRef, {
        ...data,
        id: docRef.id,
        createdAt: new Date().toISOString(),
      });
    }
    console.log("Seeding complete.");
  }
}
