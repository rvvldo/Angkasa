// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCW-Bvts7fdQovoXdIIXsMnDgU8sTURN6s",
  authDomain: "lascode-2fc55.firebaseapp.com",
  databaseURL: "https://lascode-2fc55-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lascode-2fc55",
  storageBucket: "lascode-2fc55.firebasestorage.app",
  messagingSenderId: "33461351636",
  appId: "1:33461351636:web:306acd0c5a9cf042fdb741",
  measurementId: "G-YRGG71NLLN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);