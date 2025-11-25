import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const SAVED_CARDS_COLLECTION = "savedCards";

/**
 * Save a card for a user
 * @param {string} userId - User ID
 * @param {Object} cardData - Card data (last4, expiry, cardholderName, maskedNumber)
 * @returns {Promise<string>} Card document ID
 */
export async function saveCard(userId, cardData) {
  if (!userId) throw new Error("Missing userId");
  
  const cardsRef = collection(db, SAVED_CARDS_COLLECTION);
  const cardDoc = {
    userId,
    last4: cardData.last4,
    expiryMonth: cardData.expiryMonth,
    expiryYear: cardData.expiryYear,
    cardholderName: cardData.cardholderName || "",
    maskedNumber: cardData.maskedNumber,
    isDefault: cardData.isDefault || false,
    createdAt: serverTimestamp(),
  };
  
  return addDoc(cardsRef, cardDoc);
}

/**
 * Get all saved cards for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of saved cards
 */
export async function getSavedCards(userId) {
  if (!userId) throw new Error("Missing userId");
  
  const cardsRef = collection(db, SAVED_CARDS_COLLECTION);
  const q = query(cardsRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

