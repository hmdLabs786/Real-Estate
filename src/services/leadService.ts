import { collection, query, where, getDocs, doc, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError } from '../lib/error-handler';
import { Lead, LeadStatus, OperationType } from '../types';

const COLLECTION = 'leads';

export async function createOrUpdateLead(data: Partial<Lead>) {
  if (!auth.currentUser) return null;
  
  try {
    const userId = auth.currentUser.uid;
    const docRef = doc(db, COLLECTION, userId);
    const snapshot = await getDoc(docRef);
    
    const leadData = {
      ...data,
      userId,
      email: auth.currentUser.email || '',
      displayName: auth.currentUser.displayName || '',
      lastInteraction: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    };

    if (snapshot.exists()) {
      await updateDoc(docRef, leadData);
    } else {
      await setDoc(docRef, {
        ...leadData,
        status: LeadStatus.UNQUALIFIED,
        isSerious: false,
        createdAt: new Date().toISOString(),
      });
    }
    
    const newSnapshot = await getDoc(docRef);
    return newSnapshot.data() as Lead;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION);
  }
}

export async function getCurrentLead() {
  if (!auth.currentUser) return null;
  try {
    const userId = auth.currentUser.uid;
    const docRef = doc(db, COLLECTION, userId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as Lead;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION}/${auth.currentUser?.uid}`);
  }
}

export async function getAllQualifiedLeads() {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('status', 'in', [LeadStatus.QUALIFIED, LeadStatus.SERIOUS])
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Lead);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION);
  }
}
