import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError } from '../lib/error-handler';
import { Property, OperationType, PropertyType } from '../types';

const COLLECTION = 'properties';

export async function getProperties(filters?: { area?: string, type?: PropertyType, minPrice?: number, maxPrice?: number, limit?: number }) {
  try {
    let q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    
    if (filters) {
      if (filters.area) q = query(q, where('area', '==', filters.area));
      if (filters.type) q = query(q, where('type', '==', filters.type));
      if (filters.minPrice) q = query(q, where('price', '>=', filters.minPrice));
      if (filters.maxPrice) q = query(q, where('price', '<=', filters.maxPrice));
      if (filters.limit) q = query(q, limit(filters.limit));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Property);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION);
  }
}

export async function getPropertyById(id: string) {
  try {
    const docRef = doc(db, COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as Property;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION}/${id}`);
  }
}

export async function getRecommendedProperties(budget: number, area: string, type: string) {
  try {
    // Exact matches
    const q1 = query(
      collection(db, COLLECTION),
      where('area', '==', area),
      where('type', '==', type),
      where('price', '<=', budget * 1.1), // Allow 10% higher
      limit(5)
    );
    
    const snapshot1 = await getDocs(q1);
    let results = snapshot1.docs.map(doc => doc.data() as Property);
    
    // Fallback or additional: Broaden search if needed
    if (results.length < 3) {
      const q2 = query(
        collection(db, COLLECTION),
        where('area', '==', area),
        limit(5)
      );
      const snapshot2 = await getDocs(q2);
      const areaMatches = snapshot2.docs.map(doc => doc.data() as Property)
        .filter(p => !results.find(r => r.id === p.id));
      results = [...results, ...areaMatches].slice(0, 5);
    }

    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION);
  }
}
