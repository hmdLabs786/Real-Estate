import { collection, query, where, getDocs, doc, setDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError } from '../lib/error-handler';
import { Booking, BookingStatus, OperationType } from '../types';

const COLLECTION = 'bookings';

export async function createBooking(data: { propertyId: string, date: string, time: string }) {
  if (!auth.currentUser) throw new Error("Authentication required");
  
  try {
    const docRef = doc(collection(db, COLLECTION));
    const booking: Booking = {
      id: docRef.id,
      propertyId: data.propertyId,
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email || '',
      userName: auth.currentUser.displayName || 'Anonymous User',
      date: data.date,
      time: data.time,
      status: BookingStatus.PENDING,
      createdAt: new Date().toISOString(),
    };
    
    await setDoc(docRef, {
      ...booking,
      serverCreatedAt: serverTimestamp()
    });
    
    return booking;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION);
  }
}

export async function getUserBookings() {
  if (!auth.currentUser) return [];
  try {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', auth.currentUser.uid),
      orderBy('date', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Booking);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION);
  }
}

export async function getAllBookings() {
  try {
    const q = query(collection(db, COLLECTION), orderBy('date', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Booking);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION);
  }
}
