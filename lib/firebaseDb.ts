import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db, auth } from './firebase';

export interface ScanFinding {
  label:      string;
  confidence: number;
  severity:   'normal' | 'low' | 'medium' | 'high';
  notes:      string;
  region:     string;
}

export interface MedicationSuggestion {
  name: string;
  type: string;
  dosage: string;
  frequency: string;
  duration: string;
  sideEffects: string[];
  warnings: string[];
  notes: string;
}

export interface ScanRecord {
  id?:            string;
  uid:            string;
  type:           string;
  imageURL:       string;
  status:         'AI Ready' | 'Pending' | 'Reviewed';
  findings:       ScanFinding[];
  summary:        string;
  recommendation?: string;
  medications?:   MedicationSuggestion[];
  conditionDetails?: any;
  doctorNote?:    string;
  validated?:     boolean;
  createdAt?:     Timestamp | null;
  updatedAt?:     Timestamp | null;
}

const SCANS = 'scans';

// Helper — map a QuerySnapshot to ScanRecord[]
function mapSnap(snap: QuerySnapshot<DocumentData>): ScanRecord[] {
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ScanRecord));
}

// ── Save a new scan record ─────────────────────────────────────────────────
export async function saveScan(
  data: Omit<ScanRecord, 'id' | 'uid' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const uid = auth.currentUser?.uid ?? 'anonymous';
  const ref = await addDoc(collection(db, SCANS), {
    ...data,
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// ── Load all scans for the current user (one-time) ─────────────────────────
export async function getUserScans(): Promise<ScanRecord[]> {
  const uid = auth.currentUser?.uid ?? 'anonymous';
  const q   = query(
    collection(db, SCANS),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return mapSnap(snap);
}

// ── Get recent scans for the current user (limited) ─────────────────────────
export async function getRecentScans(limitCount: number = 5): Promise<{ id: string; type: string; date: string; summary: string }[]> {
  const uid = auth.currentUser?.uid ?? 'anonymous';
  const q = query(
    collection(db, SCANS),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => {
    const data = doc.data();
    const createdAt = data.createdAt?.toDate();
    return {
      id: doc.id,
      type: data.type || 'Medical Image',
      date: createdAt ? createdAt.toLocaleDateString() : new Date().toLocaleDateString(),
      summary: data.summary || 'No summary available',
    };
  });
}

// ── Real-time listener for current user's scans ────────────────────────────
export function subscribeToUserScans(
  cb: (scans: ScanRecord[]) => void
): () => void {
  const uid = auth.currentUser?.uid ?? 'anonymous';
  const q   = query(
    collection(db, SCANS),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => cb(mapSnap(snap)));
}

// ── Load single scan ───────────────────────────────────────────────────────
export async function getScan(id: string): Promise<ScanRecord | null> {
  const snap = await getDoc(doc(db, SCANS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as ScanRecord;
}

// ── Update doctor validation ───────────────────────────────────────────────
export async function validateScan(
  id: string,
  doctorNote: string,
  validated: boolean
) {
  await updateDoc(doc(db, SCANS, id), {
    doctorNote,
    validated,
    status:    'Reviewed',
    updatedAt: serverTimestamp(),
  });
}

// ── Update scan status ─────────────────────────────────────────────────────
export async function updateScanStatus(
  id: string,
  status: ScanRecord['status']
) {
  await updateDoc(doc(db, SCANS, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

// ── Get all scans (doctor/clinic role — no uid filter) ────────────────────
export async function getAllScans(): Promise<ScanRecord[]> {
  const q = query(collection(db, SCANS), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return mapSnap(snap);
}

// ── Save a condition scan record ───────────────────────────────────────────
export async function saveConditionScan(
  data: Omit<ScanRecord, 'id' | 'uid' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const uid = auth.currentUser?.uid ?? 'anonymous';
  const ref = await addDoc(collection(db, SCANS), {
    ...data,
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// ── Load condition scans for current user ──────────────────────────────────
export async function getUserConditionScans(): Promise<ScanRecord[]> {
  const uid = auth.currentUser?.uid ?? 'anonymous';
  const q = query(
    collection(db, SCANS),
    where('uid', '==', uid),
    where('type', '==', 'Visual Condition Scan'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return mapSnap(snap);
}