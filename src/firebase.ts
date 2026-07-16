import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  deleteUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  deleteDoc, 
  updateDoc, 
  getDoc,
  setDoc,
  query, 
  orderBy, 
  onSnapshot,
  where,
  getDocs
} from 'firebase/firestore';
import type { Listing, ExchangeRequest, BlogPost } from './types';
import { INITIAL_LISTINGS, INITIAL_REQUESTS } from './mockData';

const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post_1',
    title: 'Tipps für einen erfolgreichen Futtertausch',
    category: 'Ratgeber',
    content: 'Beim Tausch von Futter und Silage spielen Qualität und Deklaration eine grosse Rolle. Erfahre, worauf du bei der Übergabe achten musst, um deinen Tauschpartner glücklich zu machen.',
    date: '2026-07-12T12:00:00Z',
    author: 'Redaktion HofTausch'
  },
  {
    id: 'post_2',
    title: 'Nachbarschaftshilfe im Aargau: Ein Erfahrungsbericht',
    category: 'Erfahrungsbericht',
    content: 'Bauer Ueli berichtet von seinen Erfahrungen mit HofTausch: „Ich brauchte dringend Hilfe bei der Obsternte und konnte im Gegenzug mein Rinderfutter anbieten. Innerhalb von 2 Tagen war alles geregelt.“',
    date: '2026-07-05T14:30:00Z',
    author: 'Ueli A.'
  },
  {
    id: 'post_3',
    title: 'Maschinengemeinschaften: Kostenteilung leicht gemacht',
    category: 'Wissen',
    content: 'Spezialmaschinen kosten viel Geld in der Anschaffung und stehen oft monatelang ungenutzt im Schuppen. Maschinengemeinschaften helfen, die Auslastung zu optimieren und Betriebskosten drastisch zu senken.',
    date: '2026-06-28T09:15:00Z',
    author: 'Redaktion HofTausch'
  }
];

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasValidConfig = !!firebaseConfig.apiKey && firebaseConfig.apiKey.trim() !== "";

let app: any;
export let auth: any;
export let db: any;
export let isMock = false;

// Mock Auth State Variables
let mockUserListeners: ((user: any) => void)[] = [];
let mockCurrentUser: any = null;

// Mock Database States
let mockListings: Listing[] = [];
let mockRequests: ExchangeRequest[] = [];
let mockBlogPosts: BlogPost[] = [];
let mockListingsListeners: ((listings: Listing[]) => void)[] = [];
let mockRequestsListeners: ((requests: ExchangeRequest[]) => void)[] = [];
let mockBlogListeners: ((posts: BlogPost[]) => void)[] = [];

// Initialize Mock database lists
const initMockDatabase = () => {
  const savedListings = localStorage.getItem('hoftausch_listings');
  mockListings = savedListings ? JSON.parse(savedListings) : INITIAL_LISTINGS;
  
  const savedRequests = localStorage.getItem('hoftausch_requests');
  mockRequests = savedRequests ? JSON.parse(savedRequests) : INITIAL_REQUESTS;

  const savedBlog = localStorage.getItem('hoftausch_blog_posts');
  mockBlogPosts = savedBlog ? JSON.parse(savedBlog) : INITIAL_BLOG_POSTS;
  
  const savedUser = localStorage.getItem('hoftausch_mock_user');
  mockCurrentUser = savedUser ? JSON.parse(savedUser) : null;
};

const saveMockDatabase = () => {
  localStorage.setItem('hoftausch_listings', JSON.stringify(mockListings));
  localStorage.setItem('hoftausch_requests', JSON.stringify(mockRequests));
  localStorage.setItem('hoftausch_blog_posts', JSON.stringify(mockBlogPosts));
  if (mockCurrentUser) {
    localStorage.setItem('hoftausch_mock_user', JSON.stringify(mockCurrentUser));
  } else {
    localStorage.removeItem('hoftausch_mock_user');
  }
};

const notifyMockListings = () => mockListingsListeners.forEach(l => l([...mockListings]));
const notifyMockRequests = () => mockRequestsListeners.forEach(l => l([...mockRequests]));
const notifyMockBlog = () => mockBlogListeners.forEach(l => l([...mockBlogPosts]));

// Setup
if (hasValidConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    isMock = false;
    console.log("Firebase initialized successfully in production mode.");
  } catch (error) {
    console.error("Failed to initialize production Firebase. Falling back to Mock mode.", error);
    isMock = true;
    initMockDatabase();
  }
} else {
  console.warn("Firebase credentials missing in .env! Running in MOCK mode.");
  isMock = true;
  initMockDatabase();
}

// ==========================================
// AUTH HELPERS
// ==========================================

export const checkIsMock = () => isMock;

export { RecaptchaVerifier };

export const onAuthChanged = (callback: (user: any) => void) => {
  if (!isMock && auth) {
    return onAuthStateChanged(auth, callback);
  } else {
    mockUserListeners.push(callback);
    // Send current state
    setTimeout(() => callback(mockCurrentUser), 20);
    return () => {
      mockUserListeners = mockUserListeners.filter(l => l !== callback);
    };
  }
};

export const sendMagicLink = async (email: string) => {
  if (!isMock && auth) {
    const actionCodeSettings = {
      url: window.location.origin + window.location.pathname,
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
    return true;
  } else {
    console.log(`[MOCK AUTH] Sending sign-in link to ${email}`);
    window.localStorage.setItem('hoftausch_mock_magic_link_email', email);
    return true;
  }
};

export const checkIsMagicLink = (href: string) => {
  if (!isMock && auth) {
    return isSignInWithEmailLink(auth, href);
  } else {
    return href.includes('magic-link=true');
  }
};

export const completeMagicLinkSignIn = async (email: string, href: string) => {
  if (!isMock && auth) {
    const result = await signInWithEmailLink(auth, email, href);
    return result.user;
  } else {
    mockCurrentUser = {
      uid: 'mock_user_email_' + email.replace(/[^a-zA-Z0-9]/g, '_'),
      displayName: `Bauer ${email.split('@')[0]}`,
      email: email,
    };
    saveMockDatabase();
    mockUserListeners.forEach(l => l(mockCurrentUser));
    return mockCurrentUser;
  }
};

export const signInPhone = async (phoneNumber: string, appVerifier: any) => {
  if (!isMock && auth) {
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  } else {
    console.log(`[MOCK AUTH] Requesting SMS code for ${phoneNumber}`);
    return {
      confirm: async (verificationCode: string) => {
        if (verificationCode === '123456') {
          mockCurrentUser = {
            uid: 'mock_user_phone_' + phoneNumber.replace(/[^a-zA-Z0-9]/g, '_'),
            displayName: `Bauer (${phoneNumber})`,
            phoneNumber: phoneNumber,
          };
          saveMockDatabase();
          mockUserListeners.forEach(l => l(mockCurrentUser));
          return { user: mockCurrentUser };
        } else {
          throw new Error('Ungültiger SMS-Code! Bitte geben Sie 123456 ein.');
        }
      }
    };
  }
};

export const signInGoogle = async () => {
  if (!isMock && auth) {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } else {
    mockCurrentUser = {
      uid: 'mock_user_google_josef',
      displayName: 'Josef (Google)',
      email: 'josef.google@landwirt.de',
      photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Josef'
    };
    saveMockDatabase();
    mockUserListeners.forEach(l => l(mockCurrentUser));
    return mockCurrentUser;
  }
};

export const signInFacebook = async () => {
  if (!isMock && auth) {
    const provider = new FacebookAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } else {
    mockCurrentUser = {
      uid: 'mock_user_facebook_huber',
      displayName: 'Biohof Huber (Meta)',
      email: 'huber.meta@facebook.com',
      photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Huber'
    };
    saveMockDatabase();
    mockUserListeners.forEach(l => l(mockCurrentUser));
    return mockCurrentUser;
  }
};


export const logOut = async () => {
  if (!isMock && auth) {
    await signOut(auth);
  } else {
    mockCurrentUser = null;
    saveMockDatabase();
    mockUserListeners.forEach(l => l(null));
  }
};

// ==========================================
// DATABASE HELPERS
// ==========================================

export const subscribeToListings = (callback: (listings: Listing[]) => void, onError?: (error: Error) => void) => {
  if (!isMock && db) {
    const q = query(collection(db, 'listings'), orderBy('date', 'desc'));
    return onSnapshot(q, 
      (snapshot) => {
        const listingsList: Listing[] = [];
        snapshot.forEach((doc) => {
          listingsList.push({ id: doc.id, ...doc.data() } as Listing);
        });
        callback(listingsList);
      },
      (error) => {
        console.error("[Firestore] Listings subscription error:", error);
        if (onError) onError(error);
      }
    );
  } else {
    mockListingsListeners.push(callback);
    // Send initial list
    setTimeout(() => callback([...mockListings]), 10);
    return () => {
      mockListingsListeners = mockListingsListeners.filter(l => l !== callback);
    };
  }
};

export const subscribeToRequests = (callback: (requests: ExchangeRequest[]) => void, onError?: (error: Error) => void) => {
  if (!isMock && db) {
    const q = query(collection(db, 'requests'), orderBy('date', 'desc'));
    return onSnapshot(q, 
      (snapshot) => {
        const requestsList: ExchangeRequest[] = [];
        snapshot.forEach((doc) => {
          requestsList.push({ id: doc.id, ...doc.data() } as ExchangeRequest);
        });
        callback(requestsList);
      },
      (error) => {
        console.error("[Firestore] Requests subscription error:", error);
        if (onError) onError(error);
      }
    );
  } else {
    mockRequestsListeners.push(callback);
    // Send initial list
    setTimeout(() => callback([...mockRequests]), 10);
    return () => {
      mockRequestsListeners = mockRequestsListeners.filter(l => l !== callback);
    };
  }
};

export const addListing = async (listing: Omit<Listing, 'id'>) => {
  if (!isMock && db) {
    const docRef = await addDoc(collection(db, 'listings'), listing);
    return docRef.id;
  } else {
    const newId = 'l_' + Date.now();
    const newListing: Listing = { id: newId, ...listing };
    mockListings = [newListing, ...mockListings];
    saveMockDatabase();
    notifyMockListings();
    return newId;
  }
};

export const updateListing = async (id: string, listingUpdate: Partial<Omit<Listing, 'id'>>) => {
  if (!isMock && db) {
    const docRef = doc(db, 'listings', id);
    await updateDoc(docRef, listingUpdate);
  } else {
    mockListings = mockListings.map(l => l.id === id ? { ...l, ...listingUpdate } : l);
    saveMockDatabase();
    notifyMockListings();
  }
};

export const deleteListing = async (id: string) => {
  if (!isMock && db) {
    await deleteDoc(doc(db, 'listings', id));
    // Also cleanup requests associated with this listing
    // Note: client side cleanup in firestore is separate or handled here
  } else {
    mockListings = mockListings.filter(l => l.id !== id);
    mockRequests = mockRequests.filter(r => r.listingId !== id);
    saveMockDatabase();
    notifyMockListings();
    notifyMockRequests();
  }
};

export const addExchangeRequest = async (request: Omit<ExchangeRequest, 'id'>) => {
  if (!isMock && db) {
    const docRef = await addDoc(collection(db, 'requests'), request);
    return docRef.id;
  } else {
    const newId = 'r_' + Date.now();
    const newRequest: ExchangeRequest = { id: newId, ...request };
    mockRequests = [newRequest, ...mockRequests];
    saveMockDatabase();
    notifyMockRequests();
    return newId;
  }
};

export const updateRequestStatus = async (id: string, status: 'akzeptiert' | 'abgelehnt') => {
  if (!isMock && db) {
    await updateDoc(doc(db, 'requests', id), { status });
  } else {
    mockRequests = mockRequests.map(r => r.id === id ? { ...r, status } : r);
    saveMockDatabase();
    notifyMockRequests();
  }
};
export const deleteExchangeRequest = async (id: string) => {
  if (!isMock && db) {
    await deleteDoc(doc(db, 'requests', id));
  } else {
    mockRequests = mockRequests.filter(r => r.id !== id);
    saveMockDatabase();
    notifyMockRequests();
  }
};

export const getUserProfile = async (uid: string): Promise<any | null> => {
  if (!isMock && db) {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (e) {
      console.warn("[HofTausch] Error reading user profile from Firestore, using local storage fallback:", e);
      const local = localStorage.getItem(`hoftausch_profile_${uid}`);
      return local ? JSON.parse(local) : null;
    }
  } else {
    const local = localStorage.getItem(`hoftausch_profile_${uid}`);
    if (local) {
      return JSON.parse(local);
    }
    // Default admin mock profile for Josef to allow instant local admin role testing
    if (uid === 'mock_user_google_josef') {
      return {
        firstName: 'Josef',
        lastName: 'Muster',
        email: 'josef.google@landwirt.de',
        phone: '+41 79 123 45 67',
        address: 'Gorwiden 32, 8057 Zürich',
        role: 'admin',
        savedContacts: []
      };
    }
    return null;
  }
};

export const saveUserProfile = async (uid: string, profileData: any) => {
  if (!isMock && db) {
    try {
      const docRef = doc(db, 'users', uid);
      await setDoc(docRef, profileData, { merge: true });
    } catch (e) {
      console.warn("[HofTausch] Error writing user profile to Firestore:", e);
    }
  }
  localStorage.setItem(`hoftausch_profile_${uid}`, JSON.stringify(profileData));
};

export const deleteUserAccountAndData = async (uid: string) => {
  if (!isMock && auth && db) {
    const currentUserInstance = auth.currentUser;
    if (!currentUserInstance || currentUserInstance.uid !== uid) {
      throw new Error("Nicht autorisiert.");
    }

    // 1. Delete user profile from Firestore
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (e) {
      console.warn("[HofTausch] Error deleting user profile:", e);
    }

    // 2. Delete user listings from Firestore
    try {
      const listingsRef = collection(db, 'listings');
      const qListings = query(listingsRef, where('userId', '==', uid));
      const listingsSnap = await getDocs(qListings);
      const deletePromises: Promise<void>[] = [];
      listingsSnap.forEach((docSnap) => {
        deletePromises.push(deleteDoc(doc(db, 'listings', docSnap.id)));
      });
      await Promise.all(deletePromises);
    } catch (e) {
      console.warn("[HofTausch] Error deleting user listings:", e);
    }

    // 3. Delete user requests from Firestore (both sent and received)
    try {
      const requestsRef = collection(db, 'requests');
      
      // Delete sent requests
      const qSent = query(requestsRef, where('senderId', '==', uid));
      const sentSnap = await getDocs(qSent);
      const sentPromises: Promise<void>[] = [];
      sentSnap.forEach((docSnap) => {
        sentPromises.push(deleteDoc(doc(db, 'requests', docSnap.id)));
      });
      await Promise.all(sentPromises);

      // Delete received requests
      const qRecv = query(requestsRef, where('receiverId', '==', uid));
      const recvSnap = await getDocs(qRecv);
      const recvPromises: Promise<void>[] = [];
      recvSnap.forEach((docSnap) => {
        recvPromises.push(deleteDoc(doc(db, 'requests', docSnap.id)));
      });
      await Promise.all(recvPromises);
    } catch (e) {
      console.warn("[HofTausch] Error deleting user requests:", e);
    }

    // 4. Delete Auth User from Firebase Auth
    await deleteUser(currentUserInstance);
  } else {
    // Mock Mode
    localStorage.removeItem(`hoftausch_profile_${uid}`);
    localStorage.removeItem('hoftausch_mock_user');
    
    // Delete user listings
    mockListings = mockListings.filter(l => l.userId !== uid);
    // Delete user requests (sent or received)
    mockRequests = mockRequests.filter(r => r.senderId !== uid && r.receiverId !== uid);
    
    saveMockDatabase();
    notifyMockListings();
    notifyMockRequests();
    
    // Trigger auth state change
    mockCurrentUser = null;
    mockUserListeners.forEach(l => l(null));
  }
};

export const subscribeToBlog = (callback: (posts: BlogPost[]) => void, onError?: (error: Error) => void) => {
  if (!isMock && db) {
    const q = query(collection(db, 'blog'), orderBy('date', 'desc'));
    return onSnapshot(q, 
      (snapshot) => {
        const postsList: BlogPost[] = [];
        snapshot.forEach((doc) => {
          postsList.push({ id: doc.id, ...doc.data() } as BlogPost);
        });
        callback(postsList);
      },
      (error) => {
        console.error("[Firestore] Blog subscription error:", error);
        if (onError) onError(error);
      }
    );
  } else {
    mockBlogListeners.push(callback);
    setTimeout(() => callback([...mockBlogPosts]), 10);
    return () => {
      mockBlogListeners = mockBlogListeners.filter(l => l !== callback);
    };
  }
};

export const addBlogPost = async (post: Omit<BlogPost, 'id'>) => {
  if (!isMock && db) {
    const docRef = await addDoc(collection(db, 'blog'), post);
    return docRef.id;
  } else {
    const newId = 'post_' + Date.now();
    const newPost: BlogPost = { id: newId, ...post };
    mockBlogPosts = [newPost, ...mockBlogPosts];
    saveMockDatabase();
    notifyMockBlog();
    return newId;
  }
};

export const deleteBlogPost = async (id: string) => {
  if (!isMock && db) {
    await deleteDoc(doc(db, 'blog', id));
  } else {
    mockBlogPosts = mockBlogPosts.filter(p => p.id !== id);
    saveMockDatabase();
    notifyMockBlog();
  }
};
