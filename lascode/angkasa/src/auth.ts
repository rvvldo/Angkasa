// src/auth.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile as updateFirebaseProfile,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase'; // 👈 pastikan `db` ada

export const authService = {
  login: (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  },

  loginWithGoogle: () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  },

  logout: () => {
    return signOut(auth);
  },
  register: async (email: string, password: string, displayName?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update displayName di Firebase Auth
    if (displayName) {
      await updateFirebaseProfile(user, { displayName });
    }

    // Simpan ke Firestore
     await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      name: displayName || email.split('@')[0],
      bio: '',
      createdAt: new Date().toISOString(),
    });

    return userCredential;
  },

  sendVerificationEmail: async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  },

  // Tambahkan fungsi untuk update profile
  updateProfile: async (updates: { name?: string; bio?: string; email?: string }) => {
    if (!auth.currentUser) throw new Error('Not logged in');
    
    const { uid } = auth.currentUser;
    
    console.log("Starting profile update for user:", uid);
    console.log("Updates:", updates);

    try {
      // Update di Auth (opsional)
      if (updates.name) {
        console.log("Updating Firebase Auth profile...");
        await updateFirebaseProfile(auth.currentUser, { displayName: updates.name });
        console.log("Firebase Auth profile updated.");
      }

      // Update di Firestore
      console.log("Updating Firestore document...");
      await setDoc(doc(db, 'users', uid), updates, { merge: true });
      console.log("Firestore document updated.");
    } catch (error) {
      console.error("Error in authService.updateProfile:", error);
      throw error;
    }
  },
};

