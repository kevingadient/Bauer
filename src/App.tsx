import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  ArrowRightLeft, 
  MapPin, 
  User, 
  Calendar, 
  Tag, 
  Check, 
  X, 
  MessageSquare, 
  Clock, 
  Trash2, 
  Info,
  ChevronRight,
  Handshake,
  AlertCircle,
  LogOut,
  Mail,
  Phone,
  Map as MapIcon,
  List,
  Pencil,
  Menu,
  Settings,
  AlertTriangle
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Listing, ExchangeRequest, BlogPost } from './types';
import { 
  checkIsMock, 
  onAuthChanged, 
  sendMagicLink, 
  checkIsMagicLink, 
  completeMagicLinkSignIn, 
  signInPhone, 
  signInGoogle,
  signInFacebook, 
  logOut, 
  subscribeToListings, 
  subscribeToRequests, 
  addListing, 
  updateListing,
  deleteListing, 
  addExchangeRequest, 
  updateRequestStatus,
  deleteExchangeRequest,
  getUserProfile,
  saveUserProfile,
  deleteUserAccountAndData,
  subscribeToBlog,
  addBlogPost,
  deleteBlogPost,
  RecaptchaVerifier,
  auth
} from './firebase';

const CATEGORY_STYLES: Record<Listing['category'], { bg: string; text: string; border: string; icon: string }> = {
  Futter: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: `${import.meta.env.BASE_URL}img/Futter.svg` },
  Saatgut: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', icon: `${import.meta.env.BASE_URL}img/Saatgut.svg` },
  Maschinen: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: `${import.meta.env.BASE_URL}img/Maschinen.svg` },
  Tiere: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: `${import.meta.env.BASE_URL}img/Tiere.svg` },
  Dienstleistung: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: `${import.meta.env.BASE_URL}img/Dienstleistung.svg` },
  Dünger: { bg: 'bg-lime-50', text: 'text-lime-800', border: 'border-lime-200', icon: `${import.meta.env.BASE_URL}img/Dunger.svg` },
  Sonstiges: { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200', icon: `${import.meta.env.BASE_URL}img/Sonstiges.svg` },
};

interface SwissLocationInfo {
  plz: string;
  city: string;
  coords: [number, number];
}

const SWISS_LOCATIONS: SwissLocationInfo[] = [
  { plz: '8001', city: 'Zürich', coords: [47.3769, 8.5417] },
  { plz: '8000', city: 'Zürich', coords: [47.3769, 8.5417] },
  { plz: '8360', city: 'Wallisellen', coords: [47.4147, 8.5912] },
  { plz: '3011', city: 'Bern', coords: [46.9480, 7.4474] },
  { plz: '3000', city: 'Bern', coords: [46.9480, 7.4474] },
  { plz: '6003', city: 'Luzern', coords: [47.0502, 8.3093] },
  { plz: '6000', city: 'Luzern', coords: [47.0502, 8.3093] },
  { plz: '4001', city: 'Basel', coords: [47.5596, 7.5886] },
  { plz: '4000', city: 'Basel', coords: [47.5596, 7.5886] },
  { plz: '1003', city: 'Lausanne', coords: [46.5197, 6.6323] },
  { plz: '1000', city: 'Lausanne', coords: [46.5197, 6.6323] },
  { plz: '1211', city: 'Genf', coords: [46.2044, 6.1432] },
  { plz: '1200', city: 'Genf', coords: [46.2044, 6.1432] },
  { plz: '8400', city: 'Winterthur', coords: [47.5026, 8.7291] },
  { plz: '9000', city: 'St. Gallen', coords: [47.4239, 9.3748] },
  { plz: '6900', city: 'Lugano', coords: [46.0037, 8.9511] },
  { plz: '2501', city: 'Biel', coords: [47.1368, 7.2468] },
  { plz: '3600', city: 'Thun', coords: [46.7579, 7.6278] },
  { plz: '7000', city: 'Chur', coords: [46.8508, 9.5320] },
  { plz: '8200', city: 'Schaffhausen', coords: [47.6958, 8.6380] },
  { plz: '1700', city: 'Freiburg', coords: [46.8064, 7.1619] },
  { plz: '6300', city: 'Zug', coords: [47.1662, 8.5155] },
  { plz: '2000', city: 'Neuchâtel', coords: [46.9900, 6.9293] },
  { plz: '1950', city: 'Sitten', coords: [46.2294, 7.3589] },
  { plz: '6500', city: 'Bellinzona', coords: [46.1956, 9.0204] },
  { plz: '5000', city: 'Aarau', coords: [47.3925, 8.0442] },
  { plz: '8500', city: 'Frauenfeld', coords: [47.5584, 8.8981] },
  { plz: '4410', city: 'Liestal', coords: [47.4844, 7.7358] },
  { plz: '6430', city: 'Schwyz', coords: [47.0208, 8.6534] },
  { plz: '6460', city: 'Altdorf', coords: [46.8804, 8.6444] },
  { plz: '6060', city: 'Sarnen', coords: [46.8961, 8.2464] },
  { plz: '6370', city: 'Stans', coords: [46.9570, 8.3660] },
  { plz: '8750', city: 'Glarus', coords: [47.0405, 9.0680] },
  { plz: '9050', city: 'Appenzell', coords: [47.3311, 9.4098] },
  { plz: '9100', city: 'Herisau', coords: [47.3857, 9.2789] },
  { plz: '2800', city: 'Delsberg', coords: [47.3649, 7.3444] },
  { plz: '4500', city: 'Solothurn', coords: [47.2079, 7.5375] },
];

const SWISS_CENTER: [number, number] = [46.8182, 8.2275];

const getCoordinatesForLocation = (locText: string): [number, number] => {
  const normalized = locText.toLowerCase().trim();
  const match = SWISS_LOCATIONS.find(loc => 
    normalized.includes(loc.city.toLowerCase()) || normalized.includes(loc.plz)
  );
  if (match) {
    return match.coords;
  }
  const postcodeMatch = normalized.match(/\b\d{4}\b/);
  if (postcodeMatch) {
    const pc = parseInt(postcodeMatch[0]);
    if (pc >= 1000 && pc < 2000) return [46.55, 6.6];
    if (pc >= 2000 && pc < 3000) return [47.1, 7.0];
    if (pc >= 3000 && pc < 4000) return [46.9, 7.5];
    if (pc >= 4000 && pc < 5000) return [47.5, 7.6];
    if (pc >= 5000 && pc < 6000) return [47.4, 8.1];
    if (pc >= 6000 && pc < 7000) return [47.0, 8.3];
    if (pc >= 7000 && pc < 8000) return [46.8, 9.5];
    if (pc >= 8000 && pc < 9000) return [47.4, 8.6];
    if (pc >= 9000 && pc < 10000) return [47.4, 9.3];
  }
  return SWISS_CENTER;
};

const getRemainingDays = (expiryDateStr?: string) => {
  if (!expiryDateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getDistanceKm = (coords1: [number, number], coords2: [number, number]): number => {
  const [lat1, lon1] = coords1;
  const [lat2, lon2] = coords2;
  
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const extractZipAndCity = (address: string): string => {
  const clean = address.trim();
  const match = clean.match(/\b\d{4}\b\s+[a-zA-ZäöüöéèàäöüÄÖÜéèàâêîôûæœ\s-]+/);
  if (match) {
    return match[0].trim();
  }
  const zipMatch = clean.match(/\b\d{4}\b/);
  if (zipMatch) {
    const zip = zipMatch[0];
    const matchLoc = SWISS_LOCATIONS.find(loc => loc.plz === zip);
    if (matchLoc) {
      return `${zip} ${matchLoc.city}`;
    }
    return zip;
  }
  return clean;
};

const fetchCoordsForZip = async (zip: string) => {
  try {
    const url = `https://api3.geo.admin.ch/rest/services/ech/SearchServer?type=locations&origins=zipcode&searchText=${zip}&sr=4326&limit=1`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        const item = data.results[0];
        return [parseFloat(item.attrs.lat), parseFloat(item.attrs.lon)] as [number, number];
      }
    }
  } catch (err) {
    console.warn("[HofTausch] Error fetching coords for zip:", err);
  }
  return null;
};

const formatDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toISOString().split('T')[0];
  } catch {
    return dateStr;
  }
};

const isNewListing = (dateStr: string): boolean => {
  try {
    const created = new Date(dateStr);
    if (isNaN(created.getTime())) return false;
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= 24;
  } catch {
    return false;
  }
};

function App() {
  const [isMock] = useState(checkIsMock);
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App data states
  const [listings, setListings] = useState<Listing[]>([]);
  const [requests, setRequests] = useState<ExchangeRequest[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  // Blog creation modal state variables
  const [showWritePostModal, setShowWritePostModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Ratgeber');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostAuthor, setNewPostAuthor] = useState('');
  const [writePostLoading, setWritePostLoading] = useState(false);

  // Navigation: 'landing' | 'market' | 'create' | 'my-listings' | 'my-requests' | 'settings' | 'about' | 'blog' | 'contribute'
  const [activeTab, setActiveTab] = useState<'landing' | 'market' | 'create' | 'my-listings' | 'my-requests' | 'settings' | 'about' | 'blog' | 'contribute'>('landing');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Listing['category'] | 'Alle'>('Alle');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedSearchCoords, setSelectedSearchCoords] = useState<[number, number] | null>(null);
  const [searchRadius, setSearchRadius] = useState<number | null>(null);
  const [marketViewMode, setMarketViewMode] = useState<'list' | 'map'>('map');

  // Filter listings
  const filteredListings = listings.filter(listing => {
    // Filter out expired listings (older than 21 days from creation)
    const todayStr = new Date().toISOString().split('T')[0];
    if (listing.expiryDate && listing.expiryDate < todayStr) {
      return false;
    }

    const matchesSearch = 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.descriptionOffer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.descriptionSeek.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Alle' || listing.category === selectedCategory;
    
    let matchesLocation = true;
    if (searchLocation.trim()) {
      if (searchRadius !== null) {
        const refCoords = selectedSearchCoords || getCoordinatesForLocation(searchLocation);
        const listingCoords = listing.coordinates || getCoordinatesForLocation(listing.location);
        
        if (refCoords && listingCoords) {
          const dist = getDistanceKm(refCoords, listingCoords);
          if (searchRadius === 0) {
            matchesLocation = dist < 0.5 || listing.location.toLowerCase().includes(searchLocation.toLowerCase());
          } else {
            matchesLocation = dist <= searchRadius;
          }
        } else {
          matchesLocation = listing.location.toLowerCase().includes(searchLocation.toLowerCase());
        }
      } else {
        matchesLocation = listing.location.toLowerCase().includes(searchLocation.toLowerCase());
      }
    }
    
    return matchesSearch && matchesCategory && matchesLocation;
  });


  // Modals
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);

  // Map references
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const recaptchaVerifierRef = useRef<any>(null);

  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  // Contact Confirmation Modal & Profile States
  const [showConfirmContactModal, setShowConfirmContactModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'create_listing' | 'send_request' | null>(null);
  
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fabBottom, setFabBottom] = useState(24);
  
  const [profileFirstName, setProfileFirstName] = useState('');
  const [profileLastName, setProfileLastName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileCheckbox, setProfileCheckbox] = useState(false);
  const [profileFirstNameError, setProfileFirstNameError] = useState('');
  const [profileLastNameError, setProfileLastNameError] = useState('');
  
  const [savedContacts, setSavedContacts] = useState<any[]>([]);
  const [selectedContactType, setSelectedContactType] = useState<string>('self');
  const [alternateFirstName, setAlternateFirstName] = useState('');
  const [alternateLastName, setAlternateLastName] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [alternateEmail, setAlternateEmail] = useState('');
  const [alternateAddress, setAlternateAddress] = useState('');
  const [saveAlternateContact, setSaveAlternateContact] = useState(false);
  const [alternateAddressSuggestions, setAlternateAddressSuggestions] = useState<{ label: string; coords: [number, number] }[]>([]);
  const [showAlternateAddressSuggestions, setShowAlternateAddressSuggestions] = useState(false);
  const [selectedAlternateCoords, setSelectedAlternateCoords] = useState<[number, number] | null>(null);
  const [lastSelectedAlternateAddress, setLastSelectedAlternateAddress] = useState('');
  
  const [profileEmailError, setProfileEmailError] = useState('');
  const [profilePhoneError, setProfilePhoneError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileAddressSuggestions, setProfileAddressSuggestions] = useState<{ label: string; coords: [number, number] }[]>([]);
  const [showProfileAddressSuggestions, setShowProfileAddressSuggestions] = useState(false);
  const [lastSelectedProfileAddress, setLastSelectedProfileAddress] = useState('');

  // Listing creation form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Listing['category']>('Futter');
  const [newOffer, setNewOffer] = useState('');
  const [newSeek, setNewSeek] = useState('');


  // Exchange request form state
  const [reqOfferedItem, setReqOfferedItem] = useState('');
  const [reqMessage, setReqMessage] = useState('');
  const [reqFarmerName, setReqFarmerName] = useState('');

  // Auth Forms state
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [emailInput, setEmailInput] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneConfirmResult, setPhoneConfirmResult] = useState<any>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Auth observer & profile loader
  useEffect(() => {
    const unsubscribe = onAuthChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setProfileFirstName(profile.firstName || '');
            setProfileLastName(profile.lastName || '');
            setProfileEmail(profile.email || user.email || '');
            setProfilePhone(profile.phone || user.phoneNumber || '');
            setProfileAddress(profile.address || '');
            setSavedContacts(profile.savedContacts || []);
            setIsAdmin(profile.role === 'admin');
          } else {
            setProfileFirstName('');
            setProfileLastName('');
            setProfileEmail(user.email || '');
            setProfilePhone(user.phoneNumber || '');
            setProfileAddress('');
            setSavedContacts([]);
            setIsAdmin(false);
          }
        } catch (e) {
          console.error("[HofTausch] Error loading user profile on auth change:", e);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Dynamic FAB position adjustment to stay above footer
  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (!footer) return;
      
      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (footerRect.top < windowHeight) {
        const visibleFooterHeight = windowHeight - footerRect.top;
        setFabBottom(visibleFooterHeight + 24);
      } else {
        setFabBottom(24);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);


  // Query parameter ?no-track=true handler
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('no-track') === 'true') {
      console.log("[HofTausch] Manual opt-out triggered via query parameter.");
      localStorage.setItem('umami.disabled', '1');
      document.cookie = "hoftausch_no_track=true; path=/; max-age=31536000; Secure; SameSite=Strict";
      showToast('Opt-out: Tracking für diesen Browser deaktiviert.');
    }
  }, []);

  // Umami Analytics dynamic tracker injection
  useEffect(() => {
    const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
    const scriptUrl = import.meta.env.VITE_UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js';
    
    // Check if tracking is disabled via cookie, localStorage or if the user is already admin
    const cookies = document.cookie.split(';');
    const isNoTrackCookie = cookies.some(c => {
      const [key, val] = c.split('=').map(s => s.trim());
      return (key === 'hoftausch_no_track' && val === 'true') || (key === 'umami.disabled' && val === '1');
    });
    const isNoTrackLocal = localStorage.getItem('umami.disabled') === '1';

    if (isNoTrackCookie || isNoTrackLocal) {
      console.log("[HofTausch] Umami tracking is disabled for this browser (Admin/No-Track cookie detected).");
      return;
    }

    if (websiteId) {
      const existingScript = document.querySelector(`script[data-website-id="${websiteId}"]`);
      if (!existingScript) {
        const script = document.createElement('script');
        script.async = true;
        script.defer = true;
        script.src = scriptUrl;
        script.setAttribute('data-website-id', websiteId);
        
        const domains = import.meta.env.VITE_UMAMI_DOMAINS;
        if (domains) {
          script.setAttribute('data-domains', domains);
        }
        
        document.head.appendChild(script);
      }
    }
  }, []);

  // Disable Umami tracking for Admin users automatically on login
  useEffect(() => {
    if (isAdmin) {
      console.log("[HofTausch] Admin detected. Disabling Umami analytics tracking.");
      localStorage.setItem('umami.disabled', '1');
      document.cookie = "hoftausch_no_track=true; path=/; max-age=31536000; Secure; SameSite=Strict";
      
      const script = document.querySelector('script[data-website-id]');
      if (script) {
        script.remove();
      }
    }
  }, [isAdmin]);

  // Global click tracker for Umami
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const umami = (window as any).umami;
      if (!umami) return;

      // Do not track clicks if no-track flags are set or user is admin
      const cookies = document.cookie.split(';');
      const isNoTrackCookie = cookies.some(c => {
        const [key, val] = c.split('=').map(s => s.trim());
        return (key === 'hoftausch_no_track' && val === 'true') || (key === 'umami.disabled' && val === '1');
      });
      const isNoTrackLocal = localStorage.getItem('umami.disabled') === '1';
      if (isNoTrackCookie || isNoTrackLocal || isAdmin) {
        return;
      }

      const target = e.target as HTMLElement;
      const interactiveEl = target.closest('button, a, [role="button"]');
      if (interactiveEl) {
        const text = interactiveEl.textContent?.trim().substring(0, 40) || '';
        const id = interactiveEl.id || '';
        const role = interactiveEl.getAttribute('role') || '';
        const label = interactiveEl.getAttribute('aria-label') || '';
        
        const descriptor = text || id || label || interactiveEl.tagName.toLowerCase();
        const eventName = `Click: ${descriptor}`;
        
        umami.track(eventName, {
          element: interactiveEl.tagName.toLowerCase(),
          id: id || undefined,
          text: text || undefined,
          label: label || undefined,
          role: role || undefined,
          path: window.location.pathname + window.location.search
        });
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [isAdmin]);


  // Magic Link handler on mount
  useEffect(() => {
    const handleMagicLink = async () => {
      const href = window.location.href;
      if (checkIsMagicLink(href)) {
        setAuthLoading(true);
        try {
          let email = window.localStorage.getItem('emailForSignIn') || 
                      window.localStorage.getItem('hoftausch_mock_magic_link_email');
          
          if (!email && !isMock) {
            email = window.prompt('Bitte gib deine E-Mail zur Verifizierung ein:');
          }
          
          if (email) {
            await completeMagicLinkSignIn(email, href);
            window.localStorage.removeItem('emailForSignIn');
            window.localStorage.removeItem('hoftausch_mock_magic_link_email');
            window.history.replaceState({}, document.title, window.location.pathname);
            showToast('Erfolgreich eingeloggt per Magic Link!');
          }
        } catch (error: any) {
          console.error(error);
          showToast('Fehler beim Einloggen per Magic Link: ' + error.message, 'error');
        } finally {
          setAuthLoading(false);
        }
      }
    };
    handleMagicLink();
  }, []);

  // Database subscriptions when authenticated
  useEffect(() => {
    if (!currentUser) {
      setListings([]);
      setRequests([]);
      setBlogPosts([]);
      return;
    }

    const unsubListings = subscribeToListings(
      (data) => {
        setListings(data);
      },
      (error) => {
        showToast('Fehler beim Laden der Inserate: ' + error.message, 'error');
      }
    );

    const unsubRequests = subscribeToRequests(
      (data) => {
        setRequests(data);
      },
      (error) => {
        showToast('Fehler beim Laden der Tauschanfragen: ' + error.message, 'error');
      }
    );

    const unsubBlog = subscribeToBlog(
      (data) => {
        setBlogPosts(data);
      },
      (error) => {
        console.warn("[HofTausch] Error loading blog posts:", error);
      }
    );

    return () => {
      unsubListings();
      unsubRequests();
      unsubBlog();
    };
  }, [currentUser]);

  const handleSearchLocationChange = async (val: string) => {
    const sanitized = val.replace(/\D/g, '').slice(0, 4);
    setSearchLocation(sanitized);
    
    if (sanitized.length === 4) {
      const localCoords = getCoordinatesForLocation(sanitized);
      if (localCoords && localCoords !== SWISS_CENTER) {
        setSelectedSearchCoords(localCoords);
      } else {
        const fetched = await fetchCoordsForZip(sanitized);
        if (fetched) {
          setSelectedSearchCoords(fetched);
        } else {
          setSelectedSearchCoords(SWISS_CENTER);
        }
      }
    } else {
      setSelectedSearchCoords(null);
    }
  };

  // Leaflet Map logic
  useEffect(() => {
    if (activeTab !== 'market' || marketViewMode !== 'map' || !currentUser) {
      // Clean up map when leaving map view
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersLayerRef.current = null;
      }
      return;
    }

    // Initialize map
    if (!mapRef.current) {
      const mapElement = document.getElementById('map-view-container');
      if (!mapElement) return;

      const leafletMap = L.map('map-view-container').setView(SWISS_CENTER, 8);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMap);

      mapRef.current = leafletMap;
      markersLayerRef.current = L.layerGroup().addTo(leafletMap);
    }

    // Update markers whenever filteredListings change
    if (markersLayerRef.current && mapRef.current) {
      markersLayerRef.current.clearLayers();
      // Group listings by coordinate key to stack overlapping listings at the same location
      const groups: Record<string, { coords: [number, number]; listings: Listing[] }> = {};
      
      filteredListings.forEach((listing) => {
        const coords = listing.coordinates || SWISS_CENTER;
        const coordKey = `${coords[0].toFixed(5)},${coords[1].toFixed(5)}`;
        if (!groups[coordKey]) {
          groups[coordKey] = { coords, listings: [] };
        }
        groups[coordKey].listings.push(listing);
      });

      Object.values(groups).forEach(({ coords, listings: groupListings }) => {
        if (groupListings.length === 0) return;
        
        // Color based on ownership: amber if any listing in the group is owned by the current user
        const hasOwn = groupListings.some(l => l.userId === currentUser?.uid);
        const markerColor = hasOwn ? '#f59e0b' : '#059669'; 
        
        const firstListing = groupListings[0];
        const catIcon = CATEGORY_STYLES[firstListing.category]?.icon || `${import.meta.env.BASE_URL}img/Sonstiges.svg`;
        
        // Build customized icon HTML. If stacked, display a badge with the count on top-right
        let iconHtml = `
          <div style="background-color: ${markerColor}; border-color: white;" class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-white shadow-lg font-display font-bold text-[10px] transform transition-transform hover:scale-115 relative">
            <img src="${catIcon}" alt="" style="width:18px;height:18px;filter:brightness(0) invert(1);" />
        `;
        if (groupListings.length > 1) {
          iconHtml += `
            <span class="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm">${groupListings.length}</span>
          `;
        }
        iconHtml += `</div>`;

        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16]
        });

        const popupContent = document.createElement('div');
        
        if (groupListings.length === 1) {
          // Single Listing Popup
          const listing = groupListings[0];
          const isOwn = listing.userId === currentUser?.uid;
          popupContent.className = 'text-left space-y-1 max-w-[200px] font-sans';
          popupContent.innerHTML = `
            <div class="flex items-center gap-1.5 mb-1">
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 inline-flex items-center gap-1"><img src="${catIcon}" alt="" style="width:12px;height:12px;" />${listing.category}</span>
              ${isOwn ? '<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white">Mein Inserat</span>' : ''}
            </div>
            <h5 class="font-bold text-stone-900 text-xs line-clamp-1 leading-snug">${listing.title}</h5>
            <p class="text-[10px] text-stone-600 line-clamp-2 leading-relaxed"><strong>Biete:</strong> ${listing.descriptionOffer}</p>
            <p class="text-[10px] text-stone-600 line-clamp-2 leading-relaxed font-medium"><strong>Suche:</strong> ${listing.descriptionSeek}</p>
            <div class="flex items-center justify-between pt-1 border-t border-stone-100 text-[9px] text-stone-400 mt-1">
              <span class="font-semibold text-stone-500">${listing.farmerName}</span>
              <span>${listing.location}</span>
            </div>
            <button id="marker-btn-${listing.id}" class="w-full mt-2 bg-emerald-600 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg hover:bg-emerald-700 transition-colors duration-200 text-center">
              Details & Tauschen
            </button>
          `;
        } else {
          // Stacked Multi-Listing Popup
          popupContent.className = 'text-left space-y-2.5 max-w-[240px] font-sans max-h-[250px] overflow-y-auto pr-1';
          
          let listHtml = `
            <div class="border-b border-stone-200 pb-1.5 mb-1.5 flex items-center justify-between">
              <span class="font-bold text-stone-900 text-[11px]">${groupListings.length} Inserate hier:</span>
              <span class="text-[9px] text-stone-500 font-semibold truncate max-w-[130px]">${firstListing.location}</span>
            </div>
            <div class="space-y-3">
          `;
          
          groupListings.forEach((listing, idx) => {
            const isOwn = listing.userId === currentUser?.uid;
            const lIcon = CATEGORY_STYLES[listing.category]?.icon || `${import.meta.env.BASE_URL}img/Sonstiges.svg`;
            listHtml += `
              <div class="space-y-1.5 ${idx > 0 ? 'border-t border-stone-100 pt-2' : ''}">
                <div class="flex items-center justify-between gap-1 flex-wrap">
                  <span class="text-[8px] font-bold px-1 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 inline-flex items-center gap-0.5">
                    <img src="${lIcon}" alt="" style="width:10px;height:10px;" />${listing.category}
                  </span>
                  ${isOwn ? '<span class="text-[8px] font-bold px-1 rounded bg-amber-500 text-white">Mein Inserat</span>' : ''}
                </div>
                <h5 class="font-bold text-stone-900 text-xs leading-snug line-clamp-1">${listing.title}</h5>
                <p class="text-[9px] text-stone-600 line-clamp-2"><strong>Biete:</strong> ${listing.descriptionOffer}</p>
                <button id="marker-btn-${listing.id}" class="w-full mt-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] py-1 px-2 rounded-lg transition-colors duration-200 text-center">
                  Details & Tauschen
                </button>
              </div>
            `;
          });
          
          listHtml += `</div>`;
          popupContent.innerHTML = listHtml;
        }

        const marker = L.marker(coords, { icon: customIcon }).addTo(markersLayerRef.current!);
        marker.bindPopup(popupContent);

        // Bind click events inside popup to open the details modal
        marker.on('popupopen', () => {
          groupListings.forEach((listing) => {
            const btn = document.getElementById(`marker-btn-${listing.id}`);
            if (btn) {
              btn.onclick = () => {
                setSelectedListing(listing);
                mapRef.current?.closePopup();
              };
            }
          });
        });
      });
    }
  }, [activeTab, marketViewMode, filteredListings, currentUser]);

  // Auth Operations
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setPhoneError('');
    try {
      await sendMagicLink(emailInput);
      setMagicLinkSent(true);
      showToast('Magic Link wurde versendet! Bitte prüfe dein Postfach.');
    } catch (error: any) {
      showToast('Fehler beim Senden des Magic Links: ' + error.message, 'error');
    }
  };

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput) return;
    setPhoneLoading(true);
    setPhoneError('');

    try {
      let appVerifier: any = null;
      if (!isMock) {
        // Clear any existing recaptcha instance to prevent listener memory leaks
        if (recaptchaVerifierRef.current) {
          try {
            recaptchaVerifierRef.current.clear();
          } catch (e) {
            console.warn("[HofTausch] Error clearing old recaptcha verifier:", e);
          }
          recaptchaVerifierRef.current = null;
        }

        // Clear recaptcha container before instantiating to prevent duplicates
        const container = document.getElementById('recaptcha-container');
        if (container) {
          container.innerHTML = '<div id="recaptcha-element"></div>';
        }
        
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-element', {
          size: 'normal'
        });
        appVerifier = recaptchaVerifierRef.current;
      }
      // Clean and format phone number to international E.164 format (+41...)
      let formattedPhone = phoneInput.replace(/[\s()-]/g, '');
      if (formattedPhone.startsWith('0') && !formattedPhone.startsWith('00')) {
        formattedPhone = '+41' + formattedPhone.substring(1);
      } else if (formattedPhone.startsWith('00')) {
        formattedPhone = '+' + formattedPhone.substring(2);
      } else if (!formattedPhone.startsWith('+')) {
        // Fallback: If it doesn't start with +, prepend +
        formattedPhone = '+' + formattedPhone;
      }

      console.log("[HofTausch] Sending SMS verification code to:", formattedPhone);
      const confirmationResult = await signInPhone(formattedPhone, appVerifier);
      setPhoneConfirmResult(confirmationResult);
      showToast('SMS-Code wurde gesendet!');
    } catch (error: any) {
      setPhoneError('SMS-Anforderungsfehler: ' + error.message);
      showToast('Fehler bei SMS-Code-Anforderung.', 'error');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || !phoneConfirmResult) return;
    setPhoneLoading(true);
    setPhoneError('');
    try {
      await phoneConfirmResult.confirm(verificationCode);
      showToast('Erfolgreich eingeloggt!');
    } catch (error: any) {
      setPhoneError('Ungültiger SMS-Code. ' + error.message);
      showToast('Login fehlgeschlagen.', 'error');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleSocialLogin = async (platform: 'google' | 'meta') => {
    try {
      if (platform === 'google') {
        await signInGoogle();
      } else {
        await signInFacebook();
      }
      showToast('Erfolgreich eingeloggt!');
    } catch (error: any) {
      showToast('Fehler beim Social Login: ' + error.message, 'error');
    }
  };

  const handleSimulateMagicLinkClick = () => {
    window.location.search = '?magic-link=true';
  };

  // Profile Address Autocomplete Helper
  const handleProfileAddressChange = (val: string) => {
    setProfileAddress(val);
  };

  const handleSelectProfileAddress = (suggestion: { label: string; coords: [number, number] }) => {
    setProfileAddress(suggestion.label);
    setLastSelectedProfileAddress(suggestion.label);
    setProfileAddressSuggestions([]);
    setShowProfileAddressSuggestions(false);
  };

  // Profile Address autocomplete Swisstopo API query with 300ms debounce
  useEffect(() => {
    const cleanVal = profileAddress.trim();
    if (cleanVal.length < 3) {
      setProfileAddressSuggestions([]);
      setShowProfileAddressSuggestions(false);
      return;
    }

    if (lastSelectedProfileAddress === cleanVal) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const url = `https://api3.geo.admin.ch/rest/services/ech/SearchServer?type=locations&origins=zipcode&searchText=${encodeURIComponent(cleanVal)}&sr=4326&limit=6`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && data.results) {
            const suggestions = data.results.map((item: any) => {
              const cleanLabel = item.attrs.label.replace(/<\/?[^>]+(>|$)/g, "").replace(/\s+/g, " ");
              return {
                label: cleanLabel,
                coords: [parseFloat(item.attrs.lat), parseFloat(item.attrs.lon)] as [number, number]
              };
            });
            setProfileAddressSuggestions(suggestions);
            setShowProfileAddressSuggestions(suggestions.length > 0);
          }
        }
      } catch (err) {
        console.warn("[HofTausch] Error fetching swisstopo profile address suggestions:", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [profileAddress, lastSelectedProfileAddress]);

  // Alternate Address Autocomplete Helper
  const handleAlternateAddressChange = (val: string) => {
    setAlternateAddress(val);
    setSelectedAlternateCoords(null);
  };

  const handleSelectAlternateAddress = (suggestion: { label: string; coords: [number, number] }) => {
    setAlternateAddress(suggestion.label);
    setLastSelectedAlternateAddress(suggestion.label);
    setSelectedAlternateCoords(suggestion.coords);
    setAlternateAddressSuggestions([]);
    setShowAlternateAddressSuggestions(false);
  };

  // Alternate Address autocomplete Swisstopo API query with 300ms debounce
  useEffect(() => {
    const cleanVal = alternateAddress.trim();
    if (cleanVal.length < 3) {
      setAlternateAddressSuggestions([]);
      setShowAlternateAddressSuggestions(false);
      return;
    }

    if (lastSelectedAlternateAddress === cleanVal) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const url = `https://api3.geo.admin.ch/rest/services/ech/SearchServer?type=locations&origins=zipcode&searchText=${encodeURIComponent(cleanVal)}&sr=4326&limit=6`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && data.results) {
            const suggestions = data.results.map((item: any) => {
              const cleanLabel = item.attrs.label.replace(/<\/?[^>]+(>|$)/g, "").replace(/\s+/g, " ");
              return {
                label: cleanLabel,
                coords: [parseFloat(item.attrs.lat), parseFloat(item.attrs.lon)] as [number, number]
              };
            });
            setAlternateAddressSuggestions(suggestions);
            setShowAlternateAddressSuggestions(suggestions.length > 0);
          }
        }
      } catch (err) {
        console.warn("[HofTausch] Error fetching swisstopo alternate address suggestions:", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [alternateAddress, lastSelectedAlternateAddress]);

  // Listing Handlers
  const handleStartEdit = (listing: Listing) => {
    setEditingListing(listing);
    setNewTitle(listing.title);
    setNewCategory(listing.category);
    setNewOffer(listing.descriptionOffer);
    setNewSeek(listing.descriptionSeek);
    
    const ownName = `${profileFirstName.trim()} ${profileLastName.trim()}`;
    if (listing.farmerName === ownName && listing.location === profileAddress) {
      setSelectedContactType('self');
    } else {
      const saved = savedContacts.find(c => `${c.firstName} ${c.lastName}` === listing.farmerName && c.address === listing.location);
      if (saved) {
        setSelectedContactType(saved.id);
        setAlternateFirstName(saved.firstName);
        setAlternateLastName(saved.lastName);
        setAlternatePhone(saved.phone);
        setAlternateEmail(saved.email);
        setAlternateAddress(saved.address);
        setSelectedAlternateCoords(saved.coordinates);
      } else {
        setSelectedContactType('other');
        const nameParts = listing.farmerName.split(' ');
        setAlternateFirstName(nameParts[0] || '');
        setAlternateLastName(nameParts.slice(1).join(' ') || '');
        setAlternateAddress(listing.location);
        
        let parsedPhone = '';
        let parsedEmail = '';
        if (listing.contact) {
          const phoneMatch = listing.contact.match(/Tel:\s*([^|]+)/);
          const emailMatch = listing.contact.match(/E-Mail:\s*([^|]+)/);
          if (phoneMatch) parsedPhone = phoneMatch[1].trim();
          if (emailMatch) parsedEmail = emailMatch[1].trim();
        }
        setAlternatePhone(parsedPhone);
        setAlternateEmail(parsedEmail);
        setSelectedAlternateCoords(listing.coordinates || null);
      }
    }
    
    setActiveTab('create');
  };

  // Profile validation helpers
  const validateProfileEmail = (val: string) => {
    const clean = val.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!clean) {
      setProfileEmailError('E-Mail-Adresse ist erforderlich.');
      return false;
    } else if (!emailRegex.test(clean)) {
      setProfileEmailError('Ungültiges E-Mail-Format.');
      return false;
    }
    setProfileEmailError('');
    return true;
  };

  const validateProfilePhone = (val: string) => {
    const clean = val.trim().replace(/[\s()-]/g, '');
    const phoneRegex = /^(\+41|0041|0)\s*[1-9](\s*[0-9]){8}$/;
    if (!clean) {
      setProfilePhoneError('Telefonnummer ist erforderlich.');
      return false;
    } else if (!phoneRegex.test(clean)) {
      setProfilePhoneError('Ungültiges Schweizer Telefonnummer-Format (z.B. +41 79 123 45 67).');
      return false;
    }
    setProfilePhoneError('');
    return true;
  };

  const validateProfileFirstName = (val: string) => {
    if (!val.trim()) {
      setProfileFirstNameError('Vorname ist erforderlich.');
      return false;
    }
    setProfileFirstNameError('');
    return true;
  };

  const validateProfileLastName = (val: string) => {
    if (!val.trim()) {
      setProfileLastNameError('Nachname ist erforderlich.');
      return false;
    }
    setProfileLastNameError('');
    return true;
  };

  const executeCreateOrUpdateListing = async () => {
    let finalFarmerName = '';
    let finalLocation = '';
    let finalContact = '';
    let coords: [number, number] | undefined = undefined;

    if (selectedContactType === 'self') {
      finalFarmerName = `${profileFirstName.trim()} ${profileLastName.trim()}`;
      finalLocation = extractZipAndCity(profileAddress);
      finalContact = `Tel: ${profilePhone.trim()} | E-Mail: ${profileEmail.trim()}${finalLocation ? ` | Adr: ${finalLocation}` : ''}`;
      coords = getCoordinatesForLocation(finalLocation);
      
      // Save profile to database (and local storage fallback)
      const profileData = {
        firstName: profileFirstName.trim(),
        lastName: profileLastName.trim(),
        email: profileEmail.trim(),
        phone: profilePhone.trim(),
        address: finalLocation,
        confirmedAt: new Date().toISOString()
      };
      await saveUserProfile(currentUser.uid, profileData);
    } else if (selectedContactType === 'other') {
      finalFarmerName = `${alternateFirstName.trim()} ${alternateLastName.trim()}`;
      finalLocation = extractZipAndCity(alternateAddress);
      finalContact = `Tel: ${alternatePhone.trim()} | E-Mail: ${alternateEmail.trim()}${finalLocation ? ` | Adr: ${finalLocation}` : ''}`;
      coords = selectedAlternateCoords || getCoordinatesForLocation(finalLocation);

      if (saveAlternateContact) {
        const newContact = {
          id: Date.now().toString(),
          firstName: alternateFirstName.trim(),
          lastName: alternateLastName.trim(),
          phone: alternatePhone.trim(),
          email: alternateEmail.trim(),
          address: finalLocation,
          coordinates: coords
        };
        const updatedContacts = [...savedContacts, newContact];
        setSavedContacts(updatedContacts);
        await saveUserProfile(currentUser.uid, { savedContacts: updatedContacts });
        // Reset alternate contact fields
        setAlternateFirstName('');
        setAlternateLastName('');
        setAlternatePhone('');
        setAlternateEmail('');
        setAlternateAddress('');
        setSaveAlternateContact(false);
        setSelectedAlternateCoords(null);
      }
    } else {
      // It's a saved contact ID!
      const contact = savedContacts.find(c => c.id === selectedContactType);
      if (contact) {
        finalFarmerName = `${contact.firstName} ${contact.lastName}`;
        finalLocation = extractZipAndCity(contact.address);
        finalContact = `Tel: ${contact.phone} | E-Mail: ${contact.email} | Adr: ${finalLocation}`;
        coords = contact.coordinates || getCoordinatesForLocation(finalLocation);
      } else {
        // Fallback
        finalFarmerName = `${profileFirstName.trim()} ${profileLastName.trim()}`;
        finalLocation = extractZipAndCity(profileAddress);
        finalContact = `Tel: ${profilePhone.trim()} | E-Mail: ${profileEmail.trim()}${finalLocation ? ` | Adr: ${finalLocation}` : ''}`;
        coords = getCoordinatesForLocation(finalLocation);
      }
    }

    if (editingListing) {
      await updateListing(editingListing.id, {
        title: newTitle,
        category: newCategory,
        descriptionOffer: newOffer,
        descriptionSeek: newSeek,
        location: finalLocation,
        farmerName: finalFarmerName,
        contact: finalContact,
        coordinates: coords
      });
      showToast('Inserat erfolgreich aktualisiert!');
      setEditingListing(null);
    } else {
      const dateToday = new Date();
      const dateString = dateToday.toISOString();
      const expiryDate = new Date(dateToday.getTime() + 21 * 24 * 60 * 60 * 1000);
      const expiryDateString = expiryDate.toISOString().split('T')[0];

      await addListing({
        title: newTitle,
        category: newCategory,
        descriptionOffer: newOffer,
        descriptionSeek: newSeek,
        location: finalLocation,
        farmerName: finalFarmerName,
        contact: finalContact,
        date: dateString,
        expiryDate: expiryDateString,
        userId: currentUser.uid,
        coordinates: coords
      });
      showToast('Inserat erfolgreich veröffentlicht!');
    }

    // Reset Form
    setNewTitle('');
    setNewOffer('');
    setNewSeek('');
    setSelectedContactType('self');
    setActiveTab('my-listings');
  };

  const handleSaveProfileFromSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const isFirstNameValid = validateProfileFirstName(profileFirstName);
    const isLastNameValid = validateProfileLastName(profileLastName);
    const isEmailValid = validateProfileEmail(profileEmail);
    const isPhoneValid = validateProfilePhone(profilePhone);

    if (!isFirstNameValid || !isLastNameValid || !isEmailValid || !isPhoneValid) {
      showToast('Bitte korrigiere die Fehler in deinen Kontaktdaten.', 'error');
      return;
    }

    setProfileLoading(true);
    try {
      const zipCity = extractZipAndCity(profileAddress);
      const profileData = {
        firstName: profileFirstName.trim(),
        lastName: profileLastName.trim(),
        email: profileEmail.trim(),
        phone: profilePhone.trim(),
        address: zipCity,
        confirmedAt: new Date().toISOString()
      };
      await saveUserProfile(currentUser.uid, profileData);
      showToast('Profil erfolgreich gespeichert!');
    } catch (error: any) {
      console.error("[HofTausch] Error saving profile:", error);
      showToast('Fehler beim Speichern: ' + error.message, 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    if (deleteConfirmText !== 'LÖSCHEN') {
      showToast('Bitte bestätige die Löschung durch Eingabe von LÖSCHEN.', 'error');
      return;
    }

    setDeleteLoading(true);
    try {
      await deleteUserAccountAndData(currentUser.uid);
      showToast('Konto und alle Daten wurden erfolgreich gelöscht.');
      
      setShowDeleteConfirmModal(false);
      setDeleteConfirmText('');
      setActiveTab('landing');
    } catch (error: any) {
      console.error("[HofTausch] Error deleting account:", error);
      showToast('Fehler beim Löschen des Kontos: ' + error.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !isAdmin) return;

    if (!newPostTitle.trim() || !newPostContent.trim() || !newPostAuthor.trim()) {
      showToast('Bitte fülle alle Pflichtfelder aus.', 'error');
      return;
    }

    setWritePostLoading(true);
    try {
      await addBlogPost({
        title: newPostTitle.trim(),
        category: newPostCategory,
        content: newPostContent.trim(),
        date: new Date().toISOString(),
        author: newPostAuthor.trim()
      });
      showToast('Blog-Beitrag erfolgreich veröffentlicht!');
      
      setNewPostTitle('');
      setNewPostCategory('Ratgeber');
      setNewPostContent('');
      setNewPostAuthor('');
      setShowWritePostModal(false);
    } catch (err: any) {
      console.error("[HofTausch] Error writing blog post:", err);
      showToast('Fehler beim Speichern des Beitrags: ' + err.message, 'error');
    } finally {
      setWritePostLoading(false);
    }
  };

  // Submission handler after user confirms their contact details in the modal
  const handleConfirmProfileAndSubmit = async () => {
    if (!currentUser) return;
    
    // Validate both fields
    const isFirstNameValid = validateProfileFirstName(profileFirstName);
    const isLastNameValid = validateProfileLastName(profileLastName);
    const isEmailValid = validateProfileEmail(profileEmail);
    const isPhoneValid = validateProfilePhone(profilePhone);
    
    if (!isFirstNameValid || !isLastNameValid || !isEmailValid || !isPhoneValid) {
      showToast('Bitte korrigiere die Fehler in deinen Kontaktdaten.', 'error');
      return;
    }

    if (!profileCheckbox) {
      showToast('Bitte bestätige die Richtigkeit deiner Angaben über die Checkbox.', 'error');
      return;
    }

    setProfileLoading(true);
    try {
      // 1. Save profile to database (and local storage fallback)
      const zipCity = extractZipAndCity(profileAddress);
      const profileData = {
        firstName: profileFirstName.trim(),
        lastName: profileLastName.trim(),
        email: profileEmail.trim(),
        phone: profilePhone.trim(),
        address: zipCity,
        confirmedAt: new Date().toISOString()
      };
      await saveUserProfile(currentUser.uid, profileData);

      // Build unified contact string for own contact
      const contactString = `Tel: ${profilePhone.trim()} | E-Mail: ${profileEmail.trim()}${zipCity ? ` | Adr: ${zipCity}` : ''}`;

      // 2. Execute the action
      if (pendingAction === 'create_listing') {
        await executeCreateOrUpdateListing();
      } else if (pendingAction === 'send_request') {
        if (!selectedListing) return;

        await addExchangeRequest({
          listingId: selectedListing.id,
          listingTitle: selectedListing.title,
          listingFarmerName: selectedListing.farmerName,
          offeredItem: reqOfferedItem,
          message: reqMessage,
          contactDetails: contactString,
          farmerName: `${profileFirstName.trim()} ${profileLastName.trim()}`,
          status: 'offen',
          date: new Date().toISOString().split('T')[0],
          senderId: currentUser.uid,
          receiverId: selectedListing.userId || 'demo'
        });

        showToast('Tauschanfrage erfolgreich gesendet!');
        
        // Reset request form
        setReqOfferedItem('');
        setReqMessage('');
        setReqFarmerName('');
        setIsExchangeModalOpen(false);
      }

      // Close modal and reset state
      setShowConfirmContactModal(false);
      setProfileCheckbox(false);
      setPendingAction(null);

    } catch (error: any) {
      console.error("[HofTausch] Error executing pending action after profile confirmation:", error);
      showToast('Fehler bei der Übertragung: ' + error.message, 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      console.warn("[HofTausch] Attempted to create/edit listing, but user is not logged in!");
      return;
    }
    if (!newTitle || !newOffer || !newSeek) {
      showToast('Bitte fülle alle Inserat-Felder aus!', 'error');
      return;
    }

    // Validate the selected contact details
    if (selectedContactType === 'self') {
      const isFirstNameValid = validateProfileFirstName(profileFirstName);
      const isLastNameValid = validateProfileLastName(profileLastName);
      const isEmailValid = validateProfileEmail(profileEmail);
      const isPhoneValid = validateProfilePhone(profilePhone);
      
      if (!isFirstNameValid || !isLastNameValid || !isEmailValid || !isPhoneValid) {
        showToast('Bitte fülle deine eigenen Kontaktdaten korrekt aus.', 'error');
        return;
      }
    } else if (selectedContactType === 'other') {
      if (!alternateFirstName.trim() || !alternateLastName.trim() || !alternatePhone.trim() || !alternateEmail.trim() || !alternateAddress.trim()) {
        showToast('Bitte fülle alle Kontaktdaten der anderen Person aus.', 'error');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(alternateEmail.trim())) {
        showToast('Ungültige E-Mail-Adresse für die andere Person.', 'error');
        return;
      }
      const phoneRegex = /^(\+41|0041|0)\s*[1-9](\s*[0-9]){8}$/;
      if (!phoneRegex.test(alternatePhone.trim().replace(/[\s()-]/g, ''))) {
        showToast('Ungültige Schweizer Telefonnummer für die andere Person.', 'error');
        return;
      }
    }

    // Check if the user's own profile is complete/confirmed.
    // If not, we trigger the Confirm Profile Modal first!
    if (!profileFirstName.trim() || !profileLastName.trim() || !profileAddress.trim() || !profileEmail.trim() || !profilePhone.trim()) {
      setPendingAction('create_listing');
      setShowConfirmContactModal(true);
      return;
    }

    setProfileLoading(true);
    try {
      await executeCreateOrUpdateListing();
    } catch (error: any) {
      console.error("[HofTausch] Error creating/updating listing:", error);
      showToast('Fehler beim Veröffentlichen: ' + error.message, 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCancelCreateOrEdit = () => {
    setNewTitle('');
    setNewOffer('');
    setNewSeek('');
    setSelectedContactType('self');
    setAlternateFirstName('');
    setAlternateLastName('');
    setAlternatePhone('');
    setAlternateEmail('');
    setAlternateAddress('');
    setSaveAlternateContact(false);
    setSelectedAlternateCoords(null);
    setEditingListing(null);
    setPendingAction(null);
    setActiveTab(editingListing ? 'my-listings' : 'market');
  };

  const handleDeleteListing = async (id: string) => {
    if (window.confirm('Möchtest du dieses Inserat wirklich löschen? Eingehende Tauschanfragen werden ebenfalls gelöscht.')) {
      try {
        await deleteListing(id);
        showToast('Inserat gelöscht.');
      } catch (error: any) {
        showToast('Fehler beim Löschen des Inserats: ' + error.message, 'error');
      }
    }
  };

  const handleSendExchangeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing || !currentUser) return;

    if (!reqOfferedItem || !reqMessage || !reqFarmerName) {
      showToast('Bitte fülle alle Pflichtfelder aus!', 'error');
      return;
    }

    // Intercept: Set pending action and open contact confirmation modal
    setPendingAction('send_request');
    setShowConfirmContactModal(true);
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: 'akzeptiert' | 'abgelehnt') => {
    try {
      await updateRequestStatus(requestId, newStatus);
      showToast(
        newStatus === 'akzeptiert' 
          ? 'Tauschanfrage akzeptiert! Kontaktdaten freigeschaltet.' 
          : 'Tauschanfrage abgelehnt.', 
        'info'
      );
    } catch (error: any) {
      showToast('Fehler beim Aktualisieren des Status: ' + error.message, 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      showToast('Erfolgreich abgemeldet.');
      setActiveTab('market');
    } catch (error: any) {
      showToast('Fehler beim Abmelden: ' + error.message, 'error');
    }
  };



  // Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-stone-600 font-medium">HofTausch wird geladen...</p>
        </div>
      </div>
    );
  }

  // Not Logged In View
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col justify-between font-sans relative overflow-hidden bg-stone-50">
        {/* Decorative Blur Backgrounds */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute left-0 bottom-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10" />

        <div className="flex-grow flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md space-y-8 animate-fade-in">
            {/* Header / Brand */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 mx-auto">
                <Handshake className="w-8 h-8" />
              </div>
              <div>
                <h1 className="font-display font-extrabold text-3xl tracking-tight text-stone-900">
                  Hof<span className="text-emerald-600">Tausch</span>
                </h1>
                <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Tauschbörse für die Schweiz</p>
              </div>
            </div>

            {/* Mock Warning Alert */}
            {isMock && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
                <p className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  Mock-Modus aktiv
                </p>
                <p>Die Firebase-Verbindung ist nicht konfiguriert. Du kannst dich mit beliebigen Anmeldedaten anmelden.</p>
                <ul className="list-disc pl-4 space-y-1 mt-1 text-[11px] text-amber-800">
                  <li><strong>SMS-Verifizierung</strong>: Trage eine Nummer ein, fordere den Code an und gib <strong>123456</strong> ein.</li>
                  <li><strong>Magic Link</strong>: Trage deine E-Mail ein, sende den Link und klicke auf den unten erscheinenden Knopf.</li>
                </ul>
              </div>
            )}

            {/* Login Card */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-stone-200/50 shadow-xl space-y-6">
              
              {/* Method Switcher */}
              <div className="flex bg-stone-100 p-1.5 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => { setLoginMethod('email'); setPhoneConfirmResult(null); setPhoneError(''); }}
                  className={`flex-1 py-2 rounded-lg font-semibold text-xs tracking-wide transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    loginMethod === 'email' 
                      ? 'bg-white text-stone-950 shadow-sm' 
                      : 'text-stone-500 hover:text-stone-950'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" /> E-Mail (Magic Link)
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('phone'); setMagicLinkSent(false); setPhoneError(''); }}
                  className={`flex-1 py-2 rounded-lg font-semibold text-xs tracking-wide transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    loginMethod === 'phone' 
                      ? 'bg-white text-stone-950 shadow-sm' 
                      : 'text-stone-500 hover:text-stone-950'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" /> Telefonnummer (SMS)
                </button>
              </div>

              {/* Email Magic Link Sign In */}
              {loginMethod === 'email' && (
                <div className="space-y-4">
                  {!magicLinkSent ? (
                    <form onSubmit={handleEmailSignIn} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">E-Mail-Adresse</label>
                        <input 
                          type="email" 
                          placeholder="z.B. tobeli-hof@bluewin.ch"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                          required
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-200 text-sm flex items-center justify-center gap-2"
                      >
                        Login-Link anfordern <ChevronRight className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <div className="text-center space-y-4 py-4 animate-fade-in">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5">
                        <p className="font-bold text-stone-900">E-Mail versendet!</p>
                        <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                          Wir haben einen Link an <strong>{emailInput}</strong> gesendet. Klicke auf diesen Link, um dich anzumelden.
                        </p>
                      </div>
                      
                      {isMock ? (
                        <div className="pt-4 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={handleSimulateMagicLinkClick}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all duration-200 inline-flex items-center gap-2"
                          >
                            [Entwickler] Magic Link Klick simulieren
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setMagicLinkSent(false)}
                          className="text-xs text-emerald-600 font-semibold hover:underline"
                        >
                          E-Mail ändern / Link erneut senden
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Phone Sign In */}
              {loginMethod === 'phone' && (
                <div className="space-y-4">
                  {phoneError && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-center gap-2 animate-fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{phoneError}</span>
                    </div>
                  )}

                  {!phoneConfirmResult ? (
                    <form onSubmit={handlePhoneSignIn} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Telefonnummer (z.B. +41791234567)</label>
                        <input 
                          type="tel" 
                          placeholder="z.B. +41791234567"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                          required
                        />
                      </div>
                      
                      {/* Recaptcha container placement inside phone tab */}
                      {!isMock && (
                        <div id="recaptcha-container" className="my-3 flex justify-center"></div>
                      )}
                      
                      <button 
                        type="submit"
                        disabled={phoneLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-200 text-sm flex items-center justify-center gap-2"
                      >
                        {phoneLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>SMS-Code anfordern <ChevronRight className="w-4 h-4" /></>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyPhoneCode} className="space-y-4 animate-fade-in">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">6-stelligen Verifizierungscode eingeben</label>
                        <input 
                          type="text" 
                          placeholder="z.B. 123456"
                          maxLength={6}
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-center tracking-widest text-lg font-bold"
                          required
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={phoneLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-200 text-sm flex items-center justify-center gap-2"
                      >
                        {phoneLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>Code verifizieren <Check className="w-4 h-4" /></>
                        )}
                      </button>
                      
                      <div className="flex justify-between items-center text-xs pt-2">
                        <button
                          type="button"
                          onClick={() => setPhoneConfirmResult(null)}
                          className="text-stone-500 hover:underline"
                        >
                          Nummer ändern
                        </button>
                        <button
                          type="button"
                          onClick={handlePhoneSignIn}
                          className="text-emerald-600 font-semibold hover:underline"
                        >
                          Code erneut senden
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Separator */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-stone-200"></div>
                <span className="flex-shrink mx-4 text-stone-400 text-xs font-bold uppercase tracking-wider">oder</span>
                <div className="flex-grow border-t border-stone-200"></div>
              </div>

              {/* Social Logins */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="flex items-center justify-center gap-2 border border-stone-300 rounded-xl py-2.5 font-semibold text-xs text-stone-700 hover:bg-stone-50 hover:border-stone-400 transition-all duration-200"
                >
                  <svg className="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.187 4.114-3.478 0-6.3-2.823-6.3-6.3 0-3.478 2.822-6.3 6.3-6.3 1.63 0 3.11.62 4.254 1.629l3.11-3.11C19.29 2.68 15.94 1 12 1 5.925 1 1 5.925 1 12s4.925 11 11 11c6.262 0 11-4.4 11-11 0-.693-.06-1.37-.18-2.015H12.24z"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('meta')}
                  className="flex items-center justify-center gap-2 border border-stone-300 rounded-xl py-2.5 font-semibold text-xs text-stone-700 hover:bg-stone-50 hover:border-stone-400 transition-all duration-200"
                >
                  <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Meta (FB)
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-stone-900 text-stone-500 py-6 border-t border-stone-850 text-center">
          <p className="text-[10px]">&copy; {new Date().getFullYear()} HofTausch. Simulierter Tauschdienst für die Landwirtschaft.</p>
        </footer>
      </div>
    );
  }

  // LOGGED IN APP VIEW
  return (
    <div className="min-h-screen flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 border transition-all duration-300 animate-fade-in ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {toast.type === 'success' && <Check className="w-5 h-5 text-emerald-600" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Mock Mode Banner */}
      {isMock && (
        <div className="bg-amber-500 text-white font-medium text-xs py-2 px-4 text-center flex items-center justify-center gap-1 border-b border-amber-600/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span><strong>HofTausch läuft im Mock-Modus</strong> (Keine Verbindung zu Firebase). Daten werden im Browser-Speicher gehalten.</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200/80">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Handshake className="w-6 h-6" />
            </div>
            <div>
              <span className="font-display font-bold text-2xl tracking-tight text-stone-900">Hof<span className="text-emerald-600">Tausch</span></span>
              <p className="text-[10px] text-stone-500 font-semibold tracking-wider uppercase">Tauschbörse für Bauern</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('landing')}
              className={`w-40 lg:w-44 h-11 flex items-center justify-center rounded-xl font-medium text-xs lg:text-sm transition-all duration-200 border ${
                activeTab === 'landing' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' 
                  : 'border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              Startseite
            </button>
            <button 
              onClick={() => setActiveTab('market')}
              className={`w-40 lg:w-44 h-11 flex items-center justify-center rounded-xl font-medium text-xs lg:text-sm transition-all duration-200 border ${
                activeTab === 'market' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' 
                  : 'border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              Marktplatz
            </button>
            <button 
              onClick={() => setActiveTab('my-listings')}
              className={`w-40 lg:w-44 h-11 flex items-center justify-center rounded-xl font-medium text-xs lg:text-sm transition-all duration-200 relative border ${
                activeTab === 'my-listings' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' 
                  : 'border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              Meine Inserate
              {requests.filter(r => listings.filter(l => l.userId === currentUser.uid).map(l => l.id).includes(r.listingId) && r.status === 'offen').length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] font-bold w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-white">
                  {requests.filter(r => listings.filter(l => l.userId === currentUser.uid).map(l => l.id).includes(r.listingId) && r.status === 'offen').length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('my-requests')}
              className={`w-40 lg:w-44 h-11 flex items-center justify-center rounded-xl font-medium text-xs lg:text-sm transition-all duration-200 border ${
                activeTab === 'my-requests' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' 
                  : 'border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              Gesendete Anfragen
            </button>
          </nav>

          {/* User profile & Logout */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('settings')}
              className="hidden sm:flex items-center gap-2 pl-4 border-l border-stone-200 hover:opacity-80 transition-opacity cursor-pointer text-left focus:outline-none"
            >
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-stone-200" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs uppercase">
                  {(currentUser.displayName || currentUser.email || 'B').charAt(0)}
                </div>
              )}
              <div className="text-left text-xs max-w-[120px]">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-stone-800 truncate">{currentUser.displayName || 'Bauer'}</p>
                  {isAdmin && <span className="bg-rose-100 text-rose-800 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-rose-200 uppercase tracking-wide shrink-0">Admin</span>}
                </div>
                <p className="text-stone-400 truncate">{currentUser.email || currentUser.phoneNumber}</p>
              </div>
            </button>
            
            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex p-2.5 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-all duration-200"
              title="Abmelden"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-950 hover:bg-stone-50 transition-all duration-200"
              aria-label="Menü öffnen"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200/80 px-4 py-3 space-y-2 shadow-sm animate-fade-in">
          <button 
            onClick={() => { setActiveTab('landing'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 border ${
              activeTab === 'landing' 
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            Startseite
          </button>
          <button 
            onClick={() => { setActiveTab('market'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 border ${
              activeTab === 'market' 
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            Marktplatz
          </button>

          <button 
            onClick={() => { setActiveTab('my-listings'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-between border ${
              activeTab === 'my-listings' 
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span className="flex items-center gap-2">Meine Inserate</span>
            {requests.filter(r => listings.filter(l => l.userId === currentUser.uid).map(l => l.id).includes(r.listingId) && r.status === 'offen').length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {requests.filter(r => listings.filter(l => l.userId === currentUser.uid).map(l => l.id).includes(r.listingId) && r.status === 'offen').length}
              </span>
            )}
          </button>
          <button 
            onClick={() => { setActiveTab('my-requests'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 border ${
              activeTab === 'my-requests' 
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            Gesendete Anfragen
          </button>
          {/* User profile inside Mobile Menu on extra small screens */}
          <div className="sm:hidden pt-3 border-t border-stone-150 flex items-center justify-between px-2">
            <button
              onClick={() => {
                setActiveTab('settings');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-85 transition-opacity cursor-pointer focus:outline-none"
            >
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-stone-200" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs uppercase shrink-0">
                  {(currentUser.displayName || currentUser.email || 'B').charAt(0)}
                </div>
              )}
              <div className="text-left text-xs truncate">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-stone-800 truncate">{currentUser.displayName || 'Bauer'}</p>
                  {isAdmin && <span className="bg-rose-100 text-rose-800 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-rose-200 uppercase tracking-wide shrink-0">Admin</span>}
                </div>
                <p className="text-stone-400 truncate text-[10px]">{currentUser.email || currentUser.phoneNumber}</p>
              </div>
            </button>
            
            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-all duration-200 shrink-0"
              title="Abmelden"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Landing Page View */}
        {activeTab === 'landing' && (
          <div className="space-y-12 animate-fade-in">
            {/* Hero Banner Section */}
            <div className="glass-card rounded-3xl p-6 sm:p-10 border border-stone-200/50 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
              <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10" />
              
              <div className="space-y-5 max-w-2xl text-center lg:text-left flex-1">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3.5 py-1.5 rounded-full uppercase tracking-wider">HofTausch Schweiz</span>
                <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-stone-900 leading-tight">
                  Tauschbörse für Bauern: <br/>
                  Gemeinsam handeln.
                </h1>
                <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
                  Biete Maschinen zur Leihe, tausche Heu gegen Futter, oder helfe einem Nachbarn beim Zaunbau. Direkt, unkompliziert und regional in der Schweiz.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                  <button 
                    onClick={() => setActiveTab('market')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-emerald-650/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Marktplatz öffnen <ArrowRightLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('create')}
                    className="bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-bold px-8 py-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-600" /> Inserat erstellen
                  </button>
                </div>
              </div>

              {/* Styled Hero Image */}
              <div className="flex-1 w-full max-w-md lg:max-w-none flex justify-center lg:justify-end">
                <div className="relative group w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] rounded-2xl overflow-hidden border border-stone-200/60 shadow-xl bg-stone-100 transition-transform duration-500 hover:scale-[1.02]">
                  <img 
                    src={`${import.meta.env.BASE_URL}img/header.webp`} 
                    alt="HofTausch Hero" 
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                    width="1200"
                    height="654"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Platform Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
              <div className="bg-white border border-stone-200/60 rounded-3xl p-8 space-y-4 hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-stone-900">Regional & Direkt</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Finde Tauschangebote direkt in Deiner Umgebung in der Schweiz. Suche gezielt nach PLZ oder Ort und unterstütze Betriebe in Deiner Region.
                </p>
              </div>

              <div className="bg-white border border-stone-200/60 rounded-3xl p-8 space-y-4 hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Tag className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-stone-900">Vielfältige Kategorien</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Egal ob Futtermittel, Saatgut, Maschinenvermietung, Arbeitskraft oder Dünger – teile Deine Ressourcen flexibel mit Kollegen.
                </p>
              </div>

              <div className="bg-white border border-stone-200/60 rounded-3xl p-8 space-y-4 hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-stone-900">Unkomplizierter Tausch</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Keine Provisionen, keine Gebühren. Kontaktiere andere Landwirte direkt per E-Mail oder Telefon und einigt Euch unkompliziert untereinander.
                </p>
              </div>
            </div>

            {/* Terms of Service Section */}
            <div className="bg-amber-50/50 border border-amber-200/60 rounded-3xl p-6 sm:p-8 space-y-4">
              <h2 className="font-display font-bold text-xl text-amber-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-700" />
                Wichtiger Hinweis zu unseren Nutzungsbedingungen
              </h2>
              <div className="text-amber-800 text-sm leading-relaxed space-y-3">
                <p>
                  HofTausch ist eine reine Vermittlungsplattform, die den Konkakt und Austausch unter Schweizer Landwirten erleichtern soll. 
                  Jegliche Nutzung der Plattform – insbesondere Absprachen, Vereinbarungen, Lieferungen und die Durchführung der Tauschgeschäfte – 
                  <strong> erfolgt vollkommen eigenverantwortlich und ausschliesslich direkt zwischen dem Inserenten und dem Tauschanbieter.</strong>
                </p>
                <p>
                  Es ist kein Dritter (weder HofTausch noch sonstige Vermittler) in den eigentlichen Tauschprozess involviert. 
                  Wir übernehmen keinerlei Haftung, Gewährleistung oder Verantwortung für die Qualität der angebotenen Tauschgüter, 
                  die Zuverlässigkeit der Partner oder eventuelle Schäden und Unstimmigkeiten, die aus einem Tauschgeschäft entstehen.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Marketplace View */}
        {activeTab === 'market' && (
          <div className="space-y-8 animate-fade-in">

            {/* Split layout: Content on Left, Sticky Filters on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Left Column: Listings and Switcher */}
              <div className="lg:col-span-3 order-2 lg:order-1 space-y-6">
                
                {/* Listings Header & View Mode Switcher */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h3 className="font-display font-bold text-xl text-stone-900">Aktuelle Inserate ({filteredListings.length})</h3>
                  
                  {/* View Switcher */}
                  <div className="flex bg-stone-100 p-1.5 rounded-xl border border-stone-200/80 shadow-sm shrink-0">
                    <button
                      onClick={() => setMarketViewMode('list')}
                      className={`px-3.5 py-2 rounded-lg font-semibold text-xs tracking-wide transition-all duration-200 flex items-center gap-1.5 ${
                        marketViewMode === 'list' 
                          ? 'bg-white text-stone-950 shadow-sm' 
                          : 'text-stone-500 hover:text-stone-950'
                      }`}
                    >
                      <List className="w-4 h-4" /> Listenansicht
                    </button>
                    <button
                      onClick={() => setMarketViewMode('map')}
                      className={`px-3.5 py-2 rounded-lg font-semibold text-xs tracking-wide transition-all duration-200 flex items-center gap-1.5 ${
                        marketViewMode === 'map' 
                          ? 'bg-white text-stone-950 shadow-sm' 
                          : 'text-stone-500 hover:text-stone-950'
                      }`}
                    >
                      <MapIcon className="w-4 h-4" /> Kartenansicht (Schweiz)
                    </button>
                  </div>
                </div>

                {filteredListings.length === 0 ? (
                  <div className="text-center py-16 glass-card rounded-2xl border border-dashed border-stone-300">
                    <AlertCircle className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                    <p className="text-stone-600 font-medium">Keine Inserate für die Filterkriterien gefunden.</p>
                    <button 
                      onClick={() => { setSearchQuery(''); setSelectedCategory('Alle'); setSearchLocation(''); }}
                      className="mt-3 text-emerald-600 font-semibold text-sm hover:underline"
                    >
                      Filter zurücksetzen
                    </button>
                  </div>
                ) : marketViewMode === 'map' ? (
                  /* Map View Mode */
                  <div className="relative glass-card p-3 rounded-3xl border border-stone-200/50 bg-white/80 shadow-md animate-fade-in">
                    <div id="map-view-container" className="leaflet-container h-[480px]"></div>
                  </div>
                ) : (
                  /* Cards Grid View Mode */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    {filteredListings.map(listing => {
                      const isOwn = listing.userId === currentUser.uid;
                      const catStyle = CATEGORY_STYLES[listing.category] || CATEGORY_STYLES.Sonstiges;
                      return (
                        <div 
                          key={listing.id}
                          className="group flex flex-col justify-between bg-white rounded-2xl border border-stone-200 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 overflow-hidden relative"
                        >
                          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                            {isNewListing(listing.date) && (
                              <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                                NEU
                              </span>
                            )}
                            {isOwn && (
                              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                Mein Inserat
                              </span>
                            )}
                          </div>
                          <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                                <img src={catStyle.icon} alt="" className="w-4 h-4" />
                                {listing.category}
                              </span>
                              <div className="flex flex-col items-end text-[10px] text-stone-400">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(listing.date)}
                                </span>
                                {listing.expiryDate && (
                                  <span className={`font-semibold mt-0.5 flex items-center gap-0.5 ${
                                    getRemainingDays(listing.expiryDate) !== null && getRemainingDays(listing.expiryDate)! <= 3 
                                      ? 'text-rose-500' 
                                      : 'text-stone-500'
                                  }`}>
                                    <Clock className="w-3 h-3 animate-pulse" />
                                    {getRemainingDays(listing.expiryDate)! < 0 
                                      ? 'Abgelaufen' 
                                      : `${getRemainingDays(listing.expiryDate)} Tage übrig`}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-display font-bold text-lg text-stone-900 group-hover:text-emerald-700 transition-colors duration-200 line-clamp-1">
                                {listing.title}
                              </h4>
                              <p className="text-xs text-stone-500 line-clamp-2">
                                <strong>Biete:</strong> {listing.descriptionOffer}
                              </p>
                              <p className="text-xs text-stone-500 line-clamp-2 font-medium">
                                <strong>Suche:</strong> {listing.descriptionSeek}
                              </p>
                            </div>
                          </div>

                          <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between mt-auto">
                            <div className="flex flex-col text-xs text-stone-500">
                              <span className="font-semibold text-stone-700 flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-stone-400" />
                                {listing.farmerName}
                              </span>
                              <span className="flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                                {listing.location}
                              </span>
                            </div>

                            <button 
                              onClick={() => setSelectedListing(listing)}
                              className="bg-stone-900 text-white group-hover:bg-emerald-600 font-semibold text-xs px-4 py-2.5 rounded-xl hover:shadow-md transition-all duration-200 flex items-center gap-1"
                            >
                              Details <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Filter and Search Panel (Sticky) */}
              <div className="lg:col-span-1 order-1 lg:order-2">
                <div className="sticky top-24 glass-card rounded-3xl p-6 border border-stone-200/50 space-y-4 bg-white/80 backdrop-blur-md">
                  <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-emerald-600" />
                    Angebote filtern
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Stichwort</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                        <input 
                          type="text" 
                          placeholder="Suche..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-white/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-xs"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Kategorie</label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                        <select 
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value as any)}
                          className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-stone-200 bg-white/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-xs appearance-none cursor-pointer"
                        >
                          <option value="Alle">Alle Kategorien</option>
                          <option value="Futter">Futtermittel</option>
                          <option value="Saatgut">Saatgut & Pflanzen</option>
                          <option value="Maschinen">Maschinen & Werkzeuge</option>
                          <option value="Tiere">Tiere</option>
                          <option value="Dienstleistung">Dienstleistung & Hilfe</option>
                          <option value="Dünger">Dünger & Kompost</option>
                          <option value="Sonstiges">Sonstiges</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Location Input for ZIP Code only */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Standort (PLZ)</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                          <input 
                            type="text" 
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="z.B. 8057"
                            value={searchLocation}
                            onChange={(e) => handleSearchLocationChange(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-white/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-xs"
                            maxLength={4}
                          />
                        </div>
                      </div>

                      {/* Radius Selector */}
                      {searchLocation.trim().length === 4 && (
                        <div className="space-y-1 animate-fade-in">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Umkreis (Radius)</label>
                          <select
                            value={searchRadius === null ? 'all' : searchRadius.toString()}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSearchRadius(val === 'all' ? null : parseInt(val));
                            }}
                            className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-xs appearance-none cursor-pointer"
                          >
                            <option value="all">Kein Filter (Unbegrenzt)</option>
                            <option value="0">0 km (Nur exakter Ort)</option>
                            <option value="5">5 km</option>
                            <option value="10">10 km</option>
                            <option value="20">20 km</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => { 
                      setSearchQuery(''); 
                      setSelectedCategory('Alle'); 
                      setSearchLocation(''); 
                      setSelectedSearchCoords(null); 
                      setSearchRadius(null); 
                    }}
                    className="w-full mt-2 text-center text-xs text-stone-500 hover:text-stone-900 border border-stone-200 hover:bg-stone-50 py-2 rounded-xl transition-all duration-150 font-medium"
                  >
                    Filter zurücksetzen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Listing Tab */}
        {activeTab === 'create' && (
          <div className="min-h-[70vh] flex flex-col justify-center py-8">
            <div className="max-w-2xl w-full mx-auto animate-fade-in space-y-6">
            <div className="text-center space-y-2">
              <h2 className="font-display font-extrabold text-3xl text-stone-900">
                {editingListing ? 'Inserat bearbeiten' : 'Neues Tauschangebot einstellen'}
              </h2>
              <p className="text-stone-600">
                {editingListing 
                  ? 'Passe dein Angebot und deine Tauschwünsche an.' 
                  : 'Inseriere kostenlos dein Angebot und deine Tauschwünsche in der Schweiz.'}
              </p>
            </div>

            <form onSubmit={handleCreateListing} className="glass-card rounded-2xl p-6 sm:p-8 border border-stone-200/50 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Inserat-Titel / Name des Gutes</label>
                  <input 
                    type="text" 
                    placeholder="z.B. 15 Rundballen Weizenstroh"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Kategorie</label>
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm cursor-pointer"
                  >
                    <option value="Futter">Futtermittel</option>
                    <option value="Saatgut">Saatgut & Pflanzen</option>
                    <option value="Maschinen">Maschinen & Werkzeuge</option>
                    <option value="Tiere">Tiere</option>
                    <option value="Dienstleistung">Dienstleistung & Hilfe</option>
                    <option value="Dünger">Dünger & Kompost</option>
                    <option value="Sonstiges">Sonstiges</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Was biete ich an? (Details)</label>
                  <textarea 
                    rows={4}
                    placeholder="Beschreibe Zustand, Menge, Qualität und ob Transportmöglichkeiten vorliegen."
                    value={newOffer}
                    onChange={(e) => setNewOffer(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Was suche ich dafür im Gegenzug?</label>
                  <textarea 
                    rows={3}
                    placeholder="Gib konkrete Tauschwünsche an (z.B. Futter, Leihgeräte, tatkräftige Hilfe oder Produkte aus dem Hofladen)."
                    value={newSeek}
                    onChange={(e) => setNewSeek(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                    required
                  />
                </div>

                <hr className="border-stone-200/60 my-6" />

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Ansprechpartner für dieses Inserat</label>
                    <select 
                      value={selectedContactType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedContactType(val);
                        if (val !== 'self' && val !== 'other') {
                          // Pre-fill alternate fields with selected saved contact to show them
                          const contact = savedContacts.find(c => c.id === val);
                          if (contact) {
                            setAlternateFirstName(contact.firstName);
                            setAlternateLastName(contact.lastName);
                            setAlternatePhone(contact.phone);
                            setAlternateEmail(contact.email);
                            setAlternateAddress(contact.address);
                            setSelectedAlternateCoords(contact.coordinates);
                          }
                        } else if (val === 'other') {
                          // Clear alternate fields
                          setAlternateFirstName('');
                          setAlternateLastName('');
                          setAlternatePhone('');
                          setAlternateEmail('');
                          setAlternateAddress('');
                          setSelectedAlternateCoords(null);
                        }
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm cursor-pointer"
                    >
                      <option value="self">Meine eigenen Kontaktdaten ({profileFirstName} {profileLastName})</option>
                      <option value="other">Für eine andere Person inserieren (Neuer Kontakt)...</option>
                      {savedContacts.map(contact => (
                        <option key={contact.id} value={contact.id}>
                          {contact.firstName} {contact.lastName} (Gespeichert: {contact.address})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Eigene Kontaktdaten Inputs (shown and editable when 'self' is selected) */}
                  {selectedContactType === 'self' && (
                    <div className="bg-stone-50/60 border border-stone-200/50 rounded-2xl p-4 sm:p-5 space-y-4">
                      <span className="text-[10px] font-bold text-stone-450 uppercase tracking-wider block">Deine eigenen Profildaten (werden in DB gespeichert)</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Vorname</label>
                          <input 
                            type="text" 
                            placeholder="Z.B. Josef"
                            value={profileFirstName}
                            onChange={(e) => setProfileFirstName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Nachname</label>
                          <input 
                            type="text" 
                            placeholder="Z.B. Muster"
                            value={profileLastName}
                            onChange={(e) => setProfileLastName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Telefonnummer</label>
                          <input 
                            type="text" 
                            placeholder="Z.B. +41 79 123 45 67"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">E-Mail-Adresse</label>
                          <input 
                            type="email" 
                            placeholder="Z.B. name@domain.ch"
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                            required
                          />
                        </div>
                      </div>

                      {/* Swisstopo Autocomplete for own address */}
                      <div className="space-y-1.5 relative">
                        <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Standort (PLZ & Ort)</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="z.B. 8057 Zürich"
                            value={profileAddress}
                            onChange={(e) => handleProfileAddressChange(e.target.value)}
                            onFocus={() => {
                              if (profileAddress.trim().length > 0 && profileAddressSuggestions.length > 0) {
                                setShowProfileAddressSuggestions(true);
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => setShowProfileAddressSuggestions(false), 205);
                            }}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                            required
                            autoComplete="off"
                          />
                          {showProfileAddressSuggestions && profileAddressSuggestions.length > 0 && (
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto divide-y divide-stone-100">
                               {profileAddressSuggestions.map((suggestion, idx) => (
                                <button
                                  key={`${suggestion.label}-${idx}`}
                                  type="button"
                                  onClick={() => handleSelectProfileAddress(suggestion)}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-stone-50 text-stone-850 flex items-center justify-between transition-colors duration-150"
                                >
                                  <span className="font-medium text-stone-800">{suggestion.label}</span>
                                  <span className="text-xs text-stone-400">Schweiz</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Alternate Contact or Saved Contact Fields */}
                  {selectedContactType !== 'self' && (
                    <div className="bg-amber-50/20 border border-amber-200/50 rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                        {selectedContactType === 'other' ? 'Kontaktdaten der fremden Person eingeben' : 'Kontaktdaten (Gespeichert, können angepasst werden)'}
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Vorname</label>
                          <input 
                            type="text" 
                            placeholder="Z.B. Peter"
                            value={alternateFirstName}
                            onChange={(e) => setAlternateFirstName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Nachname</label>
                          <input 
                            type="text" 
                            placeholder="Z.B. Keller"
                            value={alternateLastName}
                            onChange={(e) => setAlternateLastName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Telefonnummer</label>
                          <input 
                            type="text" 
                            placeholder="Z.B. +41 79 987 65 43"
                            value={alternatePhone}
                            onChange={(e) => setAlternatePhone(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">E-Mail-Adresse</label>
                          <input 
                            type="email" 
                            placeholder="Z.B. peter@domain.ch"
                            value={alternateEmail}
                            onChange={(e) => setAlternateEmail(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                            required
                          />
                        </div>
                      </div>

                      {/* Swisstopo Autocomplete for alternate address */}
                      <div className="space-y-1.5 relative">
                        <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Standort (PLZ & Ort)</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="z.B. 8057 Zürich"
                            value={alternateAddress}
                            onChange={(e) => handleAlternateAddressChange(e.target.value)}
                            onFocus={() => {
                              if (alternateAddress.trim().length > 0 && alternateAddressSuggestions.length > 0) {
                                setShowAlternateAddressSuggestions(true);
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => setShowAlternateAddressSuggestions(false), 205);
                            }}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                            required
                            autoComplete="off"
                          />
                          {showAlternateAddressSuggestions && alternateAddressSuggestions.length > 0 && (
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto divide-y divide-stone-100">
                               {alternateAddressSuggestions.map((suggestion, idx) => (
                                <button
                                  key={`${suggestion.label}-${idx}`}
                                  type="button"
                                  onClick={() => handleSelectAlternateAddress(suggestion)}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-stone-50 text-stone-850 flex items-center justify-between transition-colors duration-150"
                                >
                                  <span className="font-medium text-stone-800">{suggestion.label}</span>
                                  <span className="text-xs text-stone-400">Schweiz</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedContactType === 'other' && (
                        <div className="flex items-center gap-2 pt-1">
                          <input 
                            type="checkbox" 
                            id="saveAlternateContact"
                            checked={saveAlternateContact}
                            onChange={(e) => setSaveAlternateContact(e.target.checked)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300"
                          />
                          <label htmlFor="saveAlternateContact" className="text-xs text-stone-600 font-semibold select-none cursor-pointer">
                            Diesen Kontakt für zukünftige Inserate in meiner Liste speichern
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={handleCancelCreateOrEdit}
                  className="flex-1 border border-stone-300 text-stone-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-stone-50 transition-all duration-200 text-center text-sm"
                >
                  Abbrechen
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3.5 rounded-xl hover:shadow-lg transition-all duration-200 text-center text-sm flex items-center justify-center gap-2"
                >
                  {editingListing ? 'Änderungen speichern' : 'Inserat veröffentlichen'}
                </button>
              </div>
            </form>
          </div>
          </div>
        )}

        {/* My Listings Tab */}
        {activeTab === 'my-listings' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <h2 className="font-display font-extrabold text-3xl text-stone-900">Meine Inserate</h2>
              <p className="text-stone-600">Verwalte deine Angebote und bearbeite eingehende Tauschanfragen.</p>
            </div>

            {listings.filter(l => l.userId === currentUser.uid).length === 0 ? (
              <div className="text-center py-16 glass-card rounded-2xl border border-dashed border-stone-300">
                <Handshake className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                <p className="text-stone-600 font-medium">Du hast aktuell noch keine eigenen Inserate veröffentlicht.</p>
                <button 
                  onClick={() => setActiveTab('create')}
                  className="mt-3 bg-emerald-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl hover:shadow-md transition-all duration-200"
                >
                  Erstes Inserat erstellen
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {listings.filter(l => l.userId === currentUser.uid).map(listing => {
                  const listingRequests = requests.filter(r => r.listingId === listing.id);
                  const catStyle = CATEGORY_STYLES[listing.category] || CATEGORY_STYLES.Sonstiges;
                  
                  return (
                    <div 
                      key={listing.id}
                      className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
                    >
                      <div className="p-6 border-b border-stone-150 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-50/50">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {isNewListing(listing.date) && (
                              <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                                NEU
                              </span>
                            )}
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border flex items-center gap-1.5 ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                              <img src={catStyle.icon} alt="" className="w-4 h-4" />
                              {listing.category}
                            </span>
                            <span className="text-xs text-stone-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> Eingerichtet am {formatDate(listing.date)}
                            </span>
                            {listing.expiryDate && (
                              <span className={`text-xs font-semibold flex items-center gap-1 ${
                                getRemainingDays(listing.expiryDate) !== null && getRemainingDays(listing.expiryDate)! < 0 
                                  ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200' 
                                  : getRemainingDays(listing.expiryDate) !== null && getRemainingDays(listing.expiryDate)! <= 3
                                    ? 'text-rose-500 bg-rose-50/50 px-2 py-0.5 rounded border border-rose-100 animate-pulse'
                                    : 'text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200'
                              }`}>
                                <Clock className="w-3.5 h-3.5" />
                                {getRemainingDays(listing.expiryDate) !== null && getRemainingDays(listing.expiryDate)! < 0 ? 'Abgelaufen (nicht mehr sichtbar)' :
                                 getRemainingDays(listing.expiryDate) === 0 ? 'Läuft heute ab' :
                                 getRemainingDays(listing.expiryDate) === 1 ? 'Läuft morgen ab' :
                                 `Läuft ab in ${getRemainingDays(listing.expiryDate)} Tagen`}
                              </span>
                            )}
                          </div>
                          <h3 className="font-display font-bold text-xl text-stone-900">{listing.title}</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl text-xs">
                            <span className="text-stone-600"><strong className="text-emerald-700">Biete:</strong> {listing.descriptionOffer}</span>
                            <span className="text-stone-600"><strong className="text-amber-700">Suche:</strong> {listing.descriptionSeek}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start md:self-center">
                          <button 
                            onClick={() => handleStartEdit(listing)}
                            className="p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors duration-200"
                            title="Inserat bearbeiten"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteListing(listing.id)}
                            className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors duration-200"
                            title="Inserat löschen"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="p-6 bg-white space-y-4">
                        <h4 className="font-semibold text-sm text-stone-700 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-emerald-600" />
                          Eingehende Tauschanfragen ({listingRequests.length})
                        </h4>

                        {listingRequests.length === 0 ? (
                          <p className="text-xs text-stone-500 italic">Noch keine Anfragen für dieses Inserat vorhanden.</p>
                        ) : (
                          <div className="divide-y divide-stone-100">
                            {listingRequests.map(req => (
                              <div key={req.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-start justify-between gap-4 animate-fade-in">
                                <div className="space-y-2 max-w-2xl">
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-sm text-stone-900">{req.farmerName}</span>
                                    <span className="text-xs text-stone-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {req.date}</span>
                                    
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                      req.status === 'akzeptiert' 
                                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
                                        : req.status === 'abgelehnt'
                                          ? 'bg-rose-50 border border-rose-200 text-rose-700'
                                          : 'bg-amber-50 border border-amber-200 text-amber-700'
                                    }`}>
                                      {req.status}
                                    </span>
                                  </div>

                                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/60 text-xs text-stone-700 space-y-1">
                                    <p><strong>Bietet im Gegenzug:</strong> {req.offeredItem}</p>
                                    <p className="italic text-stone-600">"{req.message}"</p>
                                  </div>

                                  {req.status === 'akzeptiert' && (
                                    <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-2.5">
                                      <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                      <div>
                                        <p className="font-bold">Deal akzeptiert!</p>
                                        <p className="mt-0.5">Kontaktdaten von {req.farmerName}: <strong className="underline">{req.contactDetails}</strong></p>
                                        <p className="text-[10px] text-emerald-700 mt-1">Bitte setze dich direkt in Verbindung, um den Tausch zu koordinieren.</p>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {req.status === 'offen' && (
                                  <div className="flex gap-2 self-start md:self-center">
                                    <button
                                      onClick={() => handleUpdateRequestStatus(req.id, 'abgelehnt')}
                                      className="px-3.5 py-2 rounded-xl border border-stone-300 text-stone-600 font-semibold text-xs hover:bg-stone-50 transition-colors duration-200 flex items-center gap-1"
                                    >
                                      <X className="w-3.5 h-3.5" /> Ablehnen
                                    </button>
                                    <button
                                      onClick={() => handleUpdateRequestStatus(req.id, 'akzeptiert')}
                                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs hover:shadow-md transition-all duration-200 flex items-center gap-1"
                                    >
                                      <Check className="w-3.5 h-3.5" /> Akzeptieren
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Sent Requests Tab */}
        {activeTab === 'my-requests' && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h2 className="font-display font-extrabold text-3xl text-stone-900">Gesendete Tauschanfragen</h2>
              <p className="text-stone-600">Verfolge den Status deiner Angebote auf andere Inserate.</p>
            </div>

            {requests.filter(r => r.senderId === currentUser.uid).length === 0 ? (
              <div className="text-center py-16 glass-card rounded-2xl border border-dashed border-stone-300">
                <ArrowRightLeft className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                <p className="text-stone-600 font-medium">Du hast noch keine Tauschanfragen an andere Bauern versendet.</p>
                <button 
                  onClick={() => setActiveTab('market')}
                  className="mt-3 bg-emerald-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl hover:shadow-md transition-all duration-200"
                >
                  Marktplatz durchstöbern
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {requests.filter(r => r.senderId === currentUser.uid).map(req => {
                  const targetListing = listings.find(l => l.id === req.listingId);
                  
                  return (
                    <div 
                      key={req.id}
                      className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col md:flex-row justify-between gap-6"
                    >
                      <div className="space-y-3 max-w-3xl">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs text-stone-500 font-semibold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Gesendet am: {req.date}</span>
                          <span className="text-stone-300">|</span>
                          <span className="text-xs text-stone-500 font-semibold">An: {req.listingFarmerName}</span>
                          
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                            req.status === 'akzeptiert' 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                              : req.status === 'abgelehnt'
                                ? 'bg-rose-50 border-rose-200 text-rose-700'
                                : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}>
                            {req.status}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h3 className="font-display font-bold text-lg text-stone-900">Anfrage für: {req.listingTitle}</h3>
                          {targetListing && (
                            <p className="text-xs text-stone-500">Das andere Gut: Bietet: "{targetListing.descriptionOffer}" | Sucht: "{targetListing.descriptionSeek}"</p>
                          )}
                        </div>

                        <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/60 text-xs text-stone-700 space-y-1">
                          <p><strong>Dein Tauschangebot:</strong> {req.offeredItem}</p>
                          <p className="italic text-stone-600">"{req.message}"</p>
                        </div>

                        {req.status === 'akzeptiert' && targetListing && (
                          <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-2.5">
                            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold">Anfrage wurde akzeptiert!</p>
                              <p className="mt-0.5">Kontaktdaten von {req.listingFarmerName}: <strong className="underline">{targetListing.contact}</strong></p>
                              <p className="text-[10px] text-emerald-700 mt-1">Bitte nimm direkt Kontakt auf, um das Geschäft abzuschließen.</p>
                            </div>
                          </div>
                        )}
                        
                        {req.status === 'abgelehnt' && (
                          <p className="text-xs text-rose-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            Diese Anfrage wurde leider abgelehnt. Stöbere im Marktplatz nach anderen Angeboten!
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && currentUser && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="space-y-2 text-center lg:text-left">
              <h2 className="font-display font-extrabold text-3xl text-stone-900 flex items-center justify-center lg:justify-start gap-2.5"><Settings className="w-8 h-8 text-emerald-600 shrink-0" /> Benutzereinstellungen</h2>
              <p className="text-stone-600">Verwalte deine Kontaktdaten und dein Benutzerkonto auf HofTausch.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Editor */}
              <div className="lg:col-span-2 space-y-6">
                <form onSubmit={handleSaveProfileFromSettings} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-stone-900 border-b border-stone-150 pb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-600" />
                    Profil bearbeiten
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Vorname</label>
                      <input 
                        type="text" 
                        value={profileFirstName}
                        onChange={(e) => { setProfileFirstName(e.target.value); validateProfileFirstName(e.target.value); }}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-stone-50 focus:bg-white focus:ring-2 focus:outline-none transition-all duration-200 text-sm ${
                          profileFirstNameError ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : 'border-stone-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                        }`}
                        required
                      />
                      {profileFirstNameError && <p className="text-xs text-rose-600 font-semibold mt-1">{profileFirstNameError}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Nachname</label>
                      <input 
                        type="text" 
                        value={profileLastName}
                        onChange={(e) => { setProfileLastName(e.target.value); validateProfileLastName(e.target.value); }}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-stone-50 focus:bg-white focus:ring-2 focus:outline-none transition-all duration-200 text-sm ${
                          profileLastNameError ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : 'border-stone-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                        }`}
                        required
                      />
                      {profileLastNameError && <p className="text-xs text-rose-600 font-semibold mt-1">{profileLastNameError}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Telefonnummer</label>
                      <input 
                        type="text" 
                        value={profilePhone}
                        onChange={(e) => { setProfilePhone(e.target.value); validateProfilePhone(e.target.value); }}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-stone-50 focus:bg-white focus:ring-2 focus:outline-none transition-all duration-200 text-sm ${
                          profilePhoneError ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : 'border-stone-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                        }`}
                        required
                      />
                      {profilePhoneError && <p className="text-xs text-rose-600 font-semibold mt-1">{profilePhoneError}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">E-Mail-Adresse</label>
                      <input 
                        type="email" 
                        value={profileEmail}
                        onChange={(e) => { setProfileEmail(e.target.value); validateProfileEmail(e.target.value); }}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-stone-50 focus:bg-white focus:ring-2 focus:outline-none transition-all duration-200 text-sm ${
                          profileEmailError ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : 'border-stone-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                        }`}
                        required
                      />
                      {profileEmailError && <p className="text-xs text-rose-600 font-semibold mt-1">{profileEmailError}</p>}
                    </div>
                  </div>

                  {/* Swisstopo Autocomplete for location */}
                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Standort (PLZ & Ort)</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="z.B. 8057 Zürich"
                        value={profileAddress}
                        onChange={(e) => handleProfileAddressChange(e.target.value)}
                        onFocus={() => {
                          if (profileAddress.trim().length > 0 && profileAddressSuggestions.length > 0) {
                            setShowProfileAddressSuggestions(true);
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => setShowProfileAddressSuggestions(false), 200);
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                        required
                        autoComplete="off"
                      />
                      {showProfileAddressSuggestions && profileAddressSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto divide-y divide-stone-100">
                          {profileAddressSuggestions.map((suggestion, idx) => (
                            <button
                              key={`settings-addr-${suggestion.label}-${idx}`}
                              type="button"
                              onClick={() => handleSelectProfileAddress(suggestion)}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-stone-50 text-stone-850 flex items-center justify-between transition-colors duration-150"
                            >
                              <span className="font-medium text-stone-850 truncate">{suggestion.label}</span>
                              <span className="text-xs text-stone-400">Schweiz</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={profileLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-sm cursor-pointer"
                  >
                    {profileLoading ? 'Wird gespeichert...' : 'Änderungen speichern'}
                  </button>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-rose-200 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-rose-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    Gefahrenbereich
                  </h3>
                  
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Das Löschen deines Kontos ist permanent und unumkehrbar. Alle deine Inserate, Tauschanfragen und Profildaten werden sofort unwiderruflich gelöscht.
                  </p>

                  <button 
                    onClick={() => {
                      setDeleteConfirmText('');
                      setShowDeleteConfirmModal(true);
                    }}
                    className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-350 font-bold px-4 py-3 rounded-xl transition-all duration-200 text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Konto & Daten löschen
                  </button>
                </div>
              </div>
            </div>

            {/* Added User Data Tables Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-8">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <List className="w-5 h-5 text-emerald-600" />
                  Deine hinterlegten Daten verwalten
                </h3>
                <p className="text-xs text-stone-500">Hier siehst du alle von dir erstellten Einträge und kannst diese einzeln entfernen.</p>
              </div>

              {/* Listings Table */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-stone-700 uppercase tracking-wider">Veröffentlichte Inserate ({listings.filter(l => l.userId === currentUser.uid).length})</h4>
                {listings.filter(l => l.userId === currentUser.uid).length === 0 ? (
                  <p className="text-xs text-stone-500 italic bg-stone-50 p-4 rounded-xl border border-stone-150">Du hast noch keine Inserate veröffentlicht.</p>
                ) : (
                  <div className="overflow-x-auto border border-stone-200 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-200 font-bold text-stone-700">
                          <th className="p-3.5">Kategorie</th>
                          <th className="p-3.5">Titel</th>
                          <th className="p-3.5">Standort</th>
                          <th className="p-3.5">Erstellt am</th>
                          <th className="p-3.5 text-right">Aktionen</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-150">
                        {listings.filter(l => l.userId === currentUser.uid).map(listing => {
                          const catStyle = CATEGORY_STYLES[listing.category] || CATEGORY_STYLES.Sonstiges;
                          return (
                            <tr key={listing.id} className="hover:bg-stone-50/40 transition-colors">
                              <td className="p-3.5">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${catStyle.bg} ${catStyle.text} ${catStyle.border} font-semibold text-[10px]`}>
                                  <img src={catStyle.icon} alt="" className="w-3.5 h-3.5" />
                                  {listing.category}
                                </span>
                              </td>
                              <td className="p-3.5 font-semibold text-stone-850">{listing.title}</td>
                              <td className="p-3.5 text-stone-600">{listing.location}</td>
                              <td className="p-3.5 text-stone-500">{formatDate(listing.date)}</td>
                              <td className="p-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (window.confirm(`Möchtest du das Inserat "${listing.title}" wirklich dauerhaft löschen?`)) {
                                      try {
                                        await deleteListing(listing.id);
                                        showToast('Inserat erfolgreich gelöscht.');
                                      } catch (err: any) {
                                        showToast('Fehler beim Löschen: ' + err.message, 'error');
                                      }
                                    }
                                  }}
                                  className="p-1.5 rounded-lg border border-stone-200 hover:border-rose-350 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-all duration-200 cursor-pointer"
                                  title="Inserat löschen"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Requests Table */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-stone-700 uppercase tracking-wider">Gesendete Tauschanfragen ({requests.filter(r => r.senderId === currentUser.uid).length})</h4>
                {requests.filter(r => r.senderId === currentUser.uid).length === 0 ? (
                  <p className="text-xs text-stone-500 italic bg-stone-50 p-4 rounded-xl border border-stone-150">Du hast noch keine Tauschanfragen versendet.</p>
                ) : (
                  <div className="overflow-x-auto border border-stone-200 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-200 font-bold text-stone-700">
                          <th className="p-3.5">Ziel-Inserat</th>
                          <th className="p-3.5">Dein Tauschangebot</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5">Gesendet am</th>
                          <th className="p-3.5 text-right">Aktionen</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-150">
                        {requests.filter(r => r.senderId === currentUser.uid).map(req => (
                          <tr key={req.id} className="hover:bg-stone-50/40 transition-colors">
                            <td className="p-3.5 font-semibold text-stone-850">{req.listingTitle}</td>
                            <td className="p-3.5 text-stone-600 truncate max-w-[200px]">{req.offeredItem}</td>
                            <td className="p-3.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                req.status === 'akzeptiert' 
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                  : req.status === 'abgelehnt'
                                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                                    : 'bg-amber-50 border-amber-200 text-amber-700'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-stone-500">{formatDate(req.date)}</td>
                            <td className="p-3.5 text-right">
                              <button
                                type="button"
                                onClick={async () => {
                                  if (window.confirm('Möchtest du diese Tauschanfrage wirklich zurückziehen?')) {
                                    try {
                                      await deleteExchangeRequest(req.id);
                                      showToast('Tauschanfrage erfolgreich gelöscht.');
                                    } catch (err: any) {
                                      showToast('Fehler beim Löschen: ' + err.message, 'error');
                                    }
                                  }
                                }}
                                className="p-1.5 rounded-lg border border-stone-200 hover:border-rose-350 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-all duration-200 cursor-pointer"
                                title="Anfrage zurückziehen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Saved Contacts / Alternate Addresses Table */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-stone-700 uppercase tracking-wider">Gespeicherte Ansprechpartner & Adressen ({savedContacts.length})</h4>
                {savedContacts.length === 0 ? (
                  <p className="text-xs text-stone-500 italic bg-stone-50 p-4 rounded-xl border border-stone-150">Du hast noch keine zusätzlichen Kontakte gespeichert.</p>
                ) : (
                  <div className="overflow-x-auto border border-stone-200 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-200 font-bold text-stone-700">
                          <th className="p-3.5">Name</th>
                          <th className="p-3.5">E-Mail</th>
                          <th className="p-3.5">Telefon</th>
                          <th className="p-3.5">Standort (PLZ & Ort)</th>
                          <th className="p-3.5 text-right">Aktionen</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-150">
                        {savedContacts.map(contact => (
                          <tr key={contact.id} className="hover:bg-stone-50/40 transition-colors">
                            <td className="p-3.5 font-semibold text-stone-850">{contact.firstName} {contact.lastName}</td>
                            <td className="p-3.5 text-stone-600">{contact.email}</td>
                            <td className="p-3.5 text-stone-600">{contact.phone}</td>
                            <td className="p-3.5 text-stone-505">{contact.address}</td>
                            <td className="p-3.5 text-right">
                              <button
                                type="button"
                                onClick={async () => {
                                  if (window.confirm(`Möchtest du den Kontakt "${contact.firstName} ${contact.lastName}" wirklich löschen?`)) {
                                    try {
                                      const updated = savedContacts.filter(c => c.id !== contact.id);
                                      setSavedContacts(updated);
                                      await saveUserProfile(currentUser.uid, { savedContacts: updated });
                                      showToast('Kontakt erfolgreich gelöscht.');
                                    } catch (err: any) {
                                      showToast('Fehler beim Löschen: ' + err.message, 'error');
                                    }
                                  }
                                }}
                                className="p-1.5 rounded-lg border border-stone-200 hover:border-rose-350 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-all duration-200 cursor-pointer"
                                title="Kontakt löschen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* About Page */}
        {activeTab === 'about' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in py-4">
            <div className="text-center space-y-3">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">HofTausch Schweiz</span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-stone-900 leading-tight">Über uns</h2>
              <p className="text-stone-600 max-w-xl mx-auto text-sm sm:text-base">
                Erfahre more über die Vision hinter HofTausch und wie wir die lokale Kooperation unter Schweizer Landwirten stärken wollen.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-stone-900">Unsere Mission</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  HofTausch wurde gegründet, um die traditionelle Nachbarschaftshilfe in das digitale Zeitalter zu führen. Schweizer Landwirte stehen täglich vor grossen Herausforderungen: volatile Futterpreise, teure Spezialmaschinen, die nur selten gebraucht werden, und ein Mangel an flexibler Arbeitskraft.
                </p>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Wir glauben daran, dass die Lösung oft direkt nebenan liegt. Durch das unkomplizierte Anbieten und Suchen von Futtermitteln, Geräten, Tieren und Dienstleistungen können Höfe sich gegenseitig unterstützen, Ressourcen schonen und Kosten sparen.
                </p>
              </div>

              <hr className="border-stone-150" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">1</div>
                  <h4 className="font-bold text-stone-900 text-sm">Ressourcen schonen</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">Nicht jeder Hof muss jedes Spezialgerät besitzen. Teilen spart Kosten und schont das Klima.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">2</div>
                  <h4 className="font-bold text-stone-900 text-sm">Regionale Stärke</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">Kurze Wege und direkte Absprachen stärken den Zusammenhalt in den ländlichen Gemeinden.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">3</div>
                  <h4 className="font-bold text-stone-900 text-sm">Kostenlose Plattform</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">HofTausch ist und bleibt für Landwirte kostenlos. Keine versteckten Gebühren oder Provisionen.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Page */}
        {activeTab === 'blog' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-stone-200 pb-5">
              <div className="text-center sm:text-left space-y-1.5">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">HofTausch Journal</span>
                <h2 className="font-display font-extrabold text-3xl text-stone-900 leading-tight">Blog & Neuigkeiten</h2>
                <p className="text-stone-600 text-xs sm:text-sm">
                  Aktuelle Beiträge, nützliche Ratgeber und Erfolgsgeschichten aus unserer Tauschgemeinschaft.
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => {
                    setNewPostTitle('');
                    setNewPostCategory('Ratgeber');
                    setNewPostContent('');
                    setNewPostAuthor('');
                    setShowWritePostModal(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Beitrag verfassen
                </button>
              )}
            </div>

            {blogPosts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 shadow-sm">
                <p className="text-stone-500 italic text-sm">Aktuell sind noch keine Blog-Beiträge vorhanden.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {blogPosts.map(post => {
                  let catColorClass = 'bg-stone-50 text-stone-700 border-stone-150';
                  if (post.category === 'Ratgeber') catColorClass = 'bg-emerald-50 text-emerald-700 border-emerald-150';
                  else if (post.category === 'Erfahrungsbericht') catColorClass = 'bg-amber-50 text-amber-700 border-amber-150';
                  else if (post.category === 'Wissen') catColorClass = 'bg-blue-50 text-blue-700 border-blue-150';

                  return (
                    <div key={post.id} className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300 relative group">
                      {isAdmin && (
                        <button
                          onClick={async () => {
                            if (window.confirm(`Möchtest du den Beitrag "${post.title}" wirklich löschen?`)) {
                              try {
                                await deleteBlogPost(post.id);
                                showToast('Beitrag erfolgreich gelöscht.');
                              } catch (err: any) {
                                showToast('Fehler beim Löschen: ' + err.message, 'error');
                              }
                            }
                          }}
                          className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/90 border border-stone-200 hover:border-rose-350 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-all duration-150 shadow-sm z-10"
                          title="Beitrag löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      
                      <div className="p-6 space-y-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block ${catColorClass}`}>
                          {post.category}
                        </span>
                        <h3 className="font-display font-bold text-base text-stone-900 leading-tight">{post.title}</h3>
                        <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">{post.content}</p>
                      </div>
                      
                      <div className="px-6 py-4 bg-stone-50 border-t border-stone-150 flex items-center justify-between text-[10px] text-stone-450">
                        <span className="font-medium">Von: {post.author}</span>
                        <span>{formatDate(post.date)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Contribute Page */}
        {activeTab === 'contribute' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in py-4">
            <div className="text-center space-y-3">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">Mitmachen & Unterstützen</span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-stone-900 leading-tight">Mitwirken</h2>
              <p className="text-stone-600 max-w-xl mx-auto text-sm sm:text-base">
                HofTausch ist ein Gemeinschaftsprojekt. Erfahre, wie du das Projekt unterstützen und weiterentwickeln kannst.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-emerald-600" />
                  Als Landwirt/-in
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Die beste Unterstützung für HofTausch ist eine aktive Community. Erzähle deinen Berufskollegen von der Plattform, teile deine Tauschangebote oder hänge ein HofTausch-Plakat in deinem Milchraum oder lokalen Landi auf!
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-600" />
                  Als Entwickler/-in
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Das Projekt ist quelloffen (Open Source) entwickelt. Du hast Programmiererfahrung (React, Tailwind, Firebase) und möchtest neue Features einbauen oder Fehler beheben? Melde dich über Github bei uns!
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-stone-900 border-b border-stone-150 pb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                Feedback & Anregungen einsenden
              </h3>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  showToast('Vielen Dank für deine Nachricht! Wir melden uns in Kürze.');
                  (e.target as HTMLFormElement).reset();
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Deine Nachricht / Idee</label>
                  <textarea 
                    rows={4}
                    placeholder="Welche Tauschkategorien fehlen dir noch? Hast du Verbesserungsvorschläge für die Benutzeroberfläche?"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-sm cursor-pointer"
                >
                  Nachricht absenden
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* Listing Detail & Swap Request Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 animate-fade-in relative">
            
            <button 
              onClick={() => { setSelectedListing(null); setIsExchangeModalOpen(false); }}
              className="absolute top-5 right-5 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-700 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>

            {!isExchangeModalOpen ? (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {isNewListing(selectedListing.date) && (
                      <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                        NEU
                      </span>
                    )}
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                      CATEGORY_STYLES[selectedListing.category]?.bg || 'bg-stone-50'
                    } ${CATEGORY_STYLES[selectedListing.category]?.text || 'text-stone-700'} ${
                      CATEGORY_STYLES[selectedListing.category]?.border || 'border-stone-200'
                    }`}>
                      <img src={CATEGORY_STYLES[selectedListing.category]?.icon || `${import.meta.env.BASE_URL}img/Sonstiges.svg`} alt="" className="w-4 h-4" />
                      {selectedListing.category}
                    </span>
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Inseriert am {formatDate(selectedListing.date)}
                    </span>
                  </div>
                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-stone-900 leading-tight">
                    {selectedListing.title}
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-emerald-50/70 border border-emerald-200/50 rounded-2xl p-5 space-y-2">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Biete:</span>
                    <p className="text-sm text-stone-800 leading-relaxed font-medium">{selectedListing.descriptionOffer}</p>
                  </div>
                  
                  <div className="bg-amber-50/70 border border-amber-200/50 rounded-2xl p-5 space-y-2">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Suche im Tausch dafür:</span>
                    <p className="text-sm text-stone-800 leading-relaxed font-medium">{selectedListing.descriptionSeek}</p>
                  </div>
                </div>

                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-stone-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-bold">
                      {selectedListing.farmerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Landwirt</p>
                      <p className="font-semibold text-stone-800">{selectedListing.farmerName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Standort</p>
                      <p className="font-semibold text-stone-800">{selectedListing.location}</p>
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="bg-rose-50/70 border border-rose-200/60 rounded-2xl p-4 space-y-2 mt-4 animate-fade-in">
                    <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Admin-Moderationsbereich</span>
                    <p className="text-xs text-rose-700">Als Administrator kannst du dieses Inserat dauerhaft vom Marktplatz entfernen.</p>
                    <button 
                      onClick={async () => {
                        if (selectedListing) {
                          const idToDelete = selectedListing.id;
                          setSelectedListing(null);
                          await handleDeleteListing(idToDelete);
                        }
                      }}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" /> Inserat löschen (Moderation)
                    </button>
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-stone-100">
                  <button 
                    onClick={() => setSelectedListing(null)}
                    className="flex-1 border border-stone-300 text-stone-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-stone-50 transition-colors duration-200 text-sm text-center"
                  >
                    Zurück zum Markt
                  </button>
                  
                  {selectedListing.userId === currentUser.uid ? (
                    <button 
                      onClick={() => {
                        setSelectedListing(null);
                        setActiveTab('my-listings');
                      }}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3.5 rounded-xl hover:shadow-md transition-all duration-200 text-sm text-center"
                    >
                      Eingehende Anfragen ansehen
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsExchangeModalOpen(true)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3.5 rounded-xl hover:shadow-lg transition-all duration-200 text-sm text-center flex items-center justify-center gap-2"
                    >
                      <ArrowRightLeft className="w-4 h-4" /> Tauschanfrage senden
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="space-y-1">
                  <h3 className="font-display font-extrabold text-2xl text-stone-900">Tauschangebot vorschlagen</h3>
                  <p className="text-xs text-stone-500">Für: <strong className="text-emerald-700">{selectedListing.title}</strong> von {selectedListing.farmerName}</p>
                </div>

                <form onSubmit={handleSendExchangeRequest} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Was biete ich konkret zum Tausch?</label>
                    <input 
                      type="text" 
                      placeholder="z.B. 2 Kisten Bio-Äpfel & Mithilfe beim Pflügen"
                      value={reqOfferedItem}
                      onChange={(e) => setReqOfferedItem(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Nachricht / Details zum Tausch</label>
                    <textarea 
                      rows={4}
                      placeholder="Schreibe ein paar nette Worte zur Abstimmung (z.B. wann du Zeit hättest oder wie der Transport ablaufen könnte)."
                      value={reqMessage}
                      onChange={(e) => setReqMessage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Dein Hofname / Name</label>
                    <input 
                      type="text" 
                      placeholder="z.B. Forstbetrieb Schmid"
                      value={reqFarmerName}
                      onChange={(e) => setReqFarmerName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                      required
                    />
                  </div>


                  <div className="flex gap-4 pt-4 border-t border-stone-100">
                    <button 
                      type="button"
                      onClick={() => setIsExchangeModalOpen(false)}
                      className="flex-1 border border-stone-300 text-stone-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-stone-50 transition-colors duration-200 text-sm text-center"
                    >
                      Abbrechen
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3.5 rounded-xl hover:shadow-lg transition-all duration-200 text-sm text-center flex items-center justify-center gap-2"
                    >
                      Tauschanfrage absenden
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Contact Confirmation Modal */}
      {showConfirmContactModal && currentUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setShowConfirmContactModal(false);
              setPendingAction(null);
            }}
          />
          
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative z-10 border border-stone-100 flex flex-col max-h-[90vh] animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-display font-extrabold text-xl text-stone-900">Kontaktdaten bestätigen</h3>
              </div>
              <button 
                onClick={() => {
                  setShowConfirmContactModal(false);
                  setPendingAction(null);
                }}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 space-y-5 text-sm text-stone-600">
              <p className="bg-emerald-50 text-emerald-800 p-3.5 rounded-xl text-xs font-medium">
                <strong>Zwingende Angabe:</strong> Bitte bestätige deine E-Mail-Adresse und Telefonnummer. Diese Kontaktdaten sind geschützt und werden erst übertragen, wenn ein Tauschpartner deiner Tauschanfrage zustimmt.
              </p>

              <div className="space-y-4">
                {/* Vorname & Nachname */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Vorname (Pflichtfeld)</label>
                    <input 
                      type="text" 
                      placeholder="Z.B. Josef"
                      value={profileFirstName}
                      onChange={(e) => {
                        setProfileFirstName(e.target.value);
                        validateProfileFirstName(e.target.value);
                      }}
                      className={`w-full px-4 py-3 rounded-xl border bg-stone-50 focus:bg-white focus:ring-2 focus:outline-none transition-all duration-200 text-sm ${
                        profileFirstNameError 
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' 
                          : 'border-stone-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                      }`}
                      required
                    />
                    {profileFirstNameError && (
                      <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {profileFirstNameError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Nachname (Pflichtfeld)</label>
                    <input 
                      type="text" 
                      placeholder="Z.B. Muster"
                      value={profileLastName}
                      onChange={(e) => {
                        setProfileLastName(e.target.value);
                        validateProfileLastName(e.target.value);
                      }}
                      className={`w-full px-4 py-3 rounded-xl border bg-stone-50 focus:bg-white focus:ring-2 focus:outline-none transition-all duration-200 text-sm ${
                        profileLastNameError 
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' 
                          : 'border-stone-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                      }`}
                      required
                    />
                    {profileLastNameError && (
                      <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {profileLastNameError}
                      </p>
                    )}
                  </div>
                </div>

                {/* E-Mail input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">E-Mail-Adresse (Pflichtfeld)</label>
                  <input 
                    type="email" 
                    placeholder="Z.B. name@domain.ch"
                    value={profileEmail}
                    onChange={(e) => {
                      setProfileEmail(e.target.value);
                      validateProfileEmail(e.target.value);
                    }}
                    className={`w-full px-4 py-3 rounded-xl border bg-stone-50 focus:bg-white focus:ring-2 focus:outline-none transition-all duration-200 text-sm ${
                      profileEmailError 
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' 
                        : 'border-stone-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                    }`}
                    required
                  />
                  {profileEmailError && (
                    <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {profileEmailError}
                    </p>
                  )}
                </div>

                {/* Telefonnummer input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Telefonnummer (Pflichtfeld)</label>
                  <input 
                    type="text" 
                    placeholder="Z.B. +41 79 123 45 67"
                    value={profilePhone}
                    onChange={(e) => {
                      setProfilePhone(e.target.value);
                      validateProfilePhone(e.target.value);
                    }}
                    className={`w-full px-4 py-3 rounded-xl border bg-stone-50 focus:bg-white focus:ring-2 focus:outline-none transition-all duration-200 text-sm ${
                      profilePhoneError 
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' 
                        : 'border-stone-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                    }`}
                    required
                  />
                  {profilePhoneError && (
                    <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {profilePhoneError}
                    </p>
                  )}
                </div>

                {/* Adresse input (Pflichtfeld) with swisstopo autocomplete */}
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Standort (PLZ & Ort)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="z.B. 8057 Zürich"
                      value={profileAddress}
                      onChange={(e) => handleProfileAddressChange(e.target.value)}
                      onFocus={() => {
                        if (profileAddress.trim().length > 0 && profileAddressSuggestions.length > 0) {
                          setShowProfileAddressSuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        // delay hiding so that clicks on suggestions are registered
                        setTimeout(() => setShowProfileAddressSuggestions(false), 200);
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                      required
                      autoComplete="off"
                    />
                    
                    {showProfileAddressSuggestions && profileAddressSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto divide-y divide-stone-100">
                        {profileAddressSuggestions.map((suggestion, idx) => (
                          <button
                            key={`profile-${suggestion.label}-${idx}`}
                            type="button"
                            onClick={() => handleSelectProfileAddress(suggestion)}
                            className="w-full px-4 py-3 text-left text-sm hover:bg-stone-50 text-stone-850 flex items-center justify-between transition-colors duration-150"
                          >
                            <span className="font-medium text-stone-800">{suggestion.label}</span>
                            <span className="text-xs text-stone-400">Schweiz</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Confirmation Checkbox */}
                <label className="flex items-start gap-3 pt-2 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={profileCheckbox}
                    onChange={(e) => setProfileCheckbox(e.target.checked)}
                    className="mt-1 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer h-4 w-4"
                  />
                  <span className="text-xs text-stone-600 font-medium">
                    Ich bestätige, dass meine Kontaktdaten korrekt sind und im Falle eines akzeptierten Tausches an den Tauschpartner übermittelt werden dürfen.
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-stone-100">
              <button 
                type="button"
                onClick={() => {
                  setShowConfirmContactModal(false);
                  setPendingAction(null);
                }}
                className="flex-1 border border-stone-300 text-stone-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-stone-50 transition-colors duration-200 text-sm text-center"
              >
                Abbrechen
              </button>
              <button 
                onClick={handleConfirmProfileAndSubmit}
                disabled={profileLoading || !profileEmail || !profilePhone || !!profileEmailError || !!profilePhoneError || !profileCheckbox}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold px-6 py-3.5 rounded-xl hover:shadow-lg transition-all duration-200 text-sm text-center flex items-center justify-center gap-2"
              >
                {profileLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Bestätigen & Fortfahren'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Deletion Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => {
              if (!deleteLoading) setShowDeleteConfirmModal(false);
            }}
          />
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative z-10 border border-stone-100 flex flex-col animate-scale-up space-y-6">
            <button 
              onClick={() => setShowDeleteConfirmModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-700 transition-colors duration-200"
              disabled={deleteLoading}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="font-display font-extrabold text-xl text-stone-900">Bist du dir absolut sicher?</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Diese Aktion löscht dein HofTausch-Konto dauerhaft. Alle deine Inserate, Tauschanfragen und persönlichen Daten werden unwiderruflich gelöscht.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block text-center">
                  Bitte schreibe <span className="text-rose-700 font-extrabold select-all">LÖSCHEN</span> zur Bestätigung:
                </label>
                <input 
                  type="text" 
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="LÖSCHEN"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none transition-all duration-200 text-sm text-center font-bold tracking-widest"
                  disabled={deleteLoading}
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold px-4 py-3 rounded-xl transition-all duration-200 text-xs text-center cursor-pointer"
                  disabled={deleteLoading}
                >
                  Abbrechen
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'LÖSCHEN' || deleteLoading}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:bg-stone-300 text-white font-bold px-4 py-3 rounded-xl transition-all duration-200 text-xs text-center shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {deleteLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <><Trash2 className="w-4 h-4" /> Permanent löschen</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Post Writer Modal */}
      {showWritePostModal && (
        <div className="fixed inset-0 z-55 overflow-y-auto flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => {
              if (!writePostLoading) setShowWritePostModal(false);
            }}
          />
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative z-10 border border-stone-100 flex flex-col animate-scale-up space-y-5">
            <button 
              onClick={() => setShowWritePostModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-700 transition-colors duration-200 cursor-pointer"
              disabled={writePostLoading}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5">
              <h3 className="font-display font-extrabold text-xl text-stone-900">Blog-Beitrag schreiben</h3>
              <p className="text-xs text-stone-550">Veröffentliche einen neuen Beitrag im HofTausch Journal.</p>
            </div>

            <form onSubmit={handleCreateBlogPost} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Titel des Beitrags</label>
                <input 
                  type="text" 
                  placeholder="z.B. Erfolgreicher Weidetag im Jura"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                  required
                  disabled={writePostLoading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Kategorie</label>
                  <select 
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm cursor-pointer"
                    disabled={writePostLoading}
                  >
                    <option value="Ratgeber">Ratgeber</option>
                    <option value="Erfahrungsbericht">Erfahrungsbericht</option>
                    <option value="Wissen">Wissen</option>
                    <option value="Sonstiges">Sonstiges</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Autor/-in / Signatur</label>
                  <input 
                    type="text" 
                    placeholder="z.B. Redaktion HofTausch"
                    value={newPostAuthor}
                    onChange={(e) => setNewPostAuthor(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                    required
                    disabled={writePostLoading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Inhalt / Text</label>
                <textarea 
                  rows={6}
                  placeholder="Schreibe deinen interessanten Artikel hier..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                  required
                  disabled={writePostLoading}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowWritePostModal(false)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold px-4 py-3 rounded-xl transition-all duration-200 text-xs text-center cursor-pointer"
                  disabled={writePostLoading}
                >
                  Abbrechen
                </button>
                <button 
                  type="submit"
                  disabled={writePostLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-bold px-4 py-3 rounded-xl transition-all duration-200 text-xs text-center shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {writePostLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Beitrag veröffentlichen'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 mt-16 border-t border-stone-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center text-emerald-500">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-white">Hof<span className="text-emerald-500">Tausch</span></span>
              <p className="text-[9px] text-stone-500 uppercase tracking-wider">Lokale Kooperation & Tauschbörse 🇨🇭</p>
            </div>
          </div>

          {/* Footer Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-stone-400">
            <button 
              onClick={() => setActiveTab('about')}
              className={`hover:text-emerald-450 transition-colors focus:outline-none cursor-pointer ${activeTab === 'about' ? 'text-emerald-400 font-bold' : ''}`}
            >
              Über uns
            </button>
            <span className="text-stone-800">|</span>
            <button 
              onClick={() => setActiveTab('blog')}
              className={`hover:text-emerald-450 transition-colors focus:outline-none cursor-pointer ${activeTab === 'blog' ? 'text-emerald-400 font-bold' : ''}`}
            >
              Blog
            </button>
            <span className="text-stone-800">|</span>
            <button 
              onClick={() => setActiveTab('contribute')}
              className={`hover:text-emerald-450 transition-colors focus:outline-none cursor-pointer ${activeTab === 'contribute' ? 'text-emerald-400 font-bold' : ''}`}
            >
              Mitwirken
            </button>
          </div>

          <div className="text-center md:text-right space-y-1">
            <p className="text-xs">Entwickelt für die moderne & nachhaltige Landwirtschaft.</p>
            <p className="text-[10px] text-stone-600">&copy; {new Date().getFullYear()} HofTausch. Simulierter Tauschdienst.</p>
          </div>
        </div>
      </footer>

      {/* Floating Action Button (FAB) for creating a listing */}
      {currentUser && (
        <button
          onClick={() => setActiveTab('create')}
          className="fixed right-6 z-50 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 border border-emerald-500/20 group w-14 h-14 sm:w-auto sm:px-6"
          style={{ bottom: `${fabBottom}px` }}
          title="Neues Inserat erstellen"
        >
          <PlusCircle className="w-6 h-6 shrink-0 transition-transform duration-300 group-hover:rotate-90" />
          <span className="hidden sm:inline text-sm whitespace-nowrap">Inserat erstellen</span>
        </button>
      )}

    </div>
  );
}

export default App;
