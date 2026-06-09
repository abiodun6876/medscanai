import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export type UserRole = 'patient' | 'doctor' | 'clinic';

// ── Register ───────────────────────────────────────────────────────────────
export async function registerUser(
  email: string,
  password: string,
  displayName: string,
  role: UserRole
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });

  // Persist role + profile in Firestore
  await setDoc(doc(db, 'users', credential.user.uid), {
    uid:         credential.user.uid,
    email,
    displayName,
    role,
    createdAt:   serverTimestamp(),
  });

  return credential.user;
}

// ── Sign in ────────────────────────────────────────────────────────────────
export async function signIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

// ── Google OAuth ───────────────────────────────────────────────────────────
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);

  // Create Firestore profile if first-time Google login
  const ref = doc(db, 'users', credential.user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid:         credential.user.uid,
      email:       credential.user.email,
      displayName: credential.user.displayName,
      role:        'patient',
      createdAt:   serverTimestamp(),
    });
  }

  return credential.user;
}

// ── Sign out ───────────────────────────────────────────────────────────────
export async function signOut() {
  await firebaseSignOut(auth);
}

// ── Auth listener ──────────────────────────────────────────────────────────
export function subscribeToAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

// ── Get user profile ───────────────────────────────────────────────────────
export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}
