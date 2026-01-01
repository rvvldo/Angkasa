// src/auth.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  updateProfile as updateFirebaseProfile,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase'; // 👈 pastikan `db` ada

// Helper function to detect mobile
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768;
};

export const authService = {
  login: (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  },

  loginWithGoogle: () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Gunakan redirect untuk mobile, popup untuk desktop
    if (isMobile()) {
      console.log('Using signInWithRedirect for mobile');
      return signInWithRedirect(auth, provider);
    } else {
      console.log('Using signInWithPopup for desktop');
      return signInWithPopup(auth, provider);
    }
  },

  logout: () => {
    return signOut(auth);
  },

  sendVerificationEmail: () => {
    if (!auth.currentUser) {
      throw new Error('Tidak ada user yang login.');
    }
    return sendEmailVerification(auth.currentUser);
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

  // Tambahkan fungsi untuk update profile
  updateProfile: async (updates: { name?: string; bio?: string }) => {
    if (!auth.currentUser) throw new Error('Not logged in');
    
    const { uid } = auth.currentUser;
    
    // Update di Auth (opsional)
    if (updates.name) {
      await updateFirebaseProfile(auth.currentUser, { displayName: updates.name });
    }

    // Update di Firestore
    await setDoc(doc(db, 'users', uid), updates, { merge: true });
  },
};

