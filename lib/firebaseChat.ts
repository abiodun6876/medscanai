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
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QuerySnapshot,
  DocumentData,
  arrayUnion,
  setDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';

export interface ChatParticipant {
  uid: string;
  name: string;
  role: string;
}

export interface Conversation {
  id?: string;
  participants: string[];
  participantInfo: Record<string, ChatParticipant>;
  lastMessage: string;
  lastMessageTime: Timestamp | null;
  unreadCount: Record<string, number>;
  createdAt: Timestamp | null;
}

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'scan-share' | 'system';
  scanId?: string;
  imageUrl?: string;
  createdAt: Timestamp | null;
  read: boolean;
}

const CONVERSATIONS = 'conversations';

// ── Create or get existing conversation ────────────────────────────────────
export async function createConversation(otherUser: ChatParticipant): Promise<string> {
  if (!auth.currentUser) throw new Error("Not authenticated");
  
  const myUid = auth.currentUser.uid;
  const myName = auth.currentUser.displayName || auth.currentUser.email || "Me";
  
  // Check if conversation already exists
  const q = query(
    collection(db, CONVERSATIONS),
    where('participants', 'array-contains', myUid)
  );
  
  const snap = await getDocs(q);
  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    if (data.participants.includes(otherUser.uid)) {
      return docSnap.id; // Return existing conversation ID
    }
  }
  
  // Create new conversation
  const newConvData = {
    participants: [myUid, otherUser.uid],
    participantInfo: {
      [myUid]: { uid: myUid, name: myName, role: 'patient' }, // Need to resolve true role later
      [otherUser.uid]: otherUser
    },
    lastMessage: 'Conversation started',
    lastMessageTime: serverTimestamp(),
    unreadCount: { [myUid]: 0, [otherUser.uid]: 0 },
    createdAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, CONVERSATIONS), newConvData);
  return docRef.id;
}

// ── Send a message ─────────────────────────────────────────────────────────
export async function sendMessage(
  conversationId: string, 
  content: string, 
  type: ChatMessage['type'] = 'text',
  extraData?: { scanId?: string, imageUrl?: string }
): Promise<void> {
  if (!auth.currentUser) throw new Error("Not authenticated");
  
  const uid = auth.currentUser.uid;
  const name = auth.currentUser.displayName || auth.currentUser.email || "User";
  
  const msg: Omit<ChatMessage, 'id'> = {
    senderId: uid,
    senderName: name,
    content,
    type,
    ...extraData,
    createdAt: serverTimestamp() as any,
    read: false
  };
  
  // Add message
  await addDoc(collection(db, `${CONVERSATIONS}/${conversationId}/messages`), msg);
  
  // Update conversation metadata
  const convRef = doc(db, CONVERSATIONS, conversationId);
  const convSnap = await getDoc(convRef);
  
  if (convSnap.exists()) {
    const data = convSnap.data();
    const otherParticipant = data.participants.find((p: string) => p !== uid);
    
    await updateDoc(convRef, {
      lastMessage: type === 'scan-share' ? 'Shared a scan' : type === 'image' ? 'Sent an image' : content,
      lastMessageTime: serverTimestamp(),
      [`unreadCount.${otherParticipant}`]: (data.unreadCount[otherParticipant] || 0) + 1
    });
  }
}

// ── Subscribe to conversations list ────────────────────────────────────────
export function subscribeToConversations(cb: (convs: Conversation[]) => void): () => void {
  if (!auth.currentUser) return () => {};
  
  const uid = auth.currentUser.uid;
  const q = query(
    collection(db, CONVERSATIONS),
    where('participants', 'array-contains', uid),
    orderBy('lastMessageTime', 'desc')
  );
  
  return onSnapshot(q, (snap) => {
    const convs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Conversation));
    cb(convs);
  });
}

// ── Subscribe to messages ──────────────────────────────────────────────────
export function subscribeToMessages(conversationId: string, cb: (msgs: ChatMessage[]) => void): () => void {
  const q = query(
    collection(db, `${CONVERSATIONS}/${conversationId}/messages`),
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
    cb(msgs);
  });
}

// ── Mark conversation as read ──────────────────────────────────────────────
export async function markAsRead(conversationId: string): Promise<void> {
  if (!auth.currentUser) return;
  const uid = auth.currentUser.uid;
  
  const convRef = doc(db, CONVERSATIONS, conversationId);
  await updateDoc(convRef, {
    [`unreadCount.${uid}`]: 0
  });
}

// ── Get available doctors (mock/placeholder logic) ─────────────────────────
export async function getAvailableDoctors(): Promise<ChatParticipant[]> {
  const q = query(collection(db, 'users'), where('role', 'in', ['doctor', 'clinic']));
  const snap = await getDocs(q);
  const doctors = snap.docs.map(d => {
    const data = d.data();
    return {
      uid: d.id,
      name: data.displayName || data.email || 'Doctor',
      role: data.role || 'doctor'
    };
  });

  if (doctors.length === 0) {
    return [
      { uid: 'mock-doc-1', name: 'Dr. Sarah Smith', role: 'Dermatologist' },
      { uid: 'mock-doc-2', name: 'Dr. James Wilson', role: 'General Practice' },
      { uid: 'mock-doc-3', name: 'Dr. Emily Chen', role: 'Pediatrician' }
    ];
  }

  return doctors;
}
