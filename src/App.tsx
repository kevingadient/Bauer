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
  Menu
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Listing, ExchangeRequest } from './types';
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
  getUserProfile,
  saveUserProfile,
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

function App() {
  const [isMock] = useState(checkIsMock);
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App data states
  const [listings, setListings] = useState<Listing[]>([]);
  const [requests, setRequests] = useState<ExchangeRequest[]>([]);

  // Navigation: 'landing' | 'market' | 'create' | 'my-listings' | 'my-requests'
  const [activeTab, setActiveTab] = useState<'landing' | 'market' | 'create' | 'my-listings' | 'my-requests'>('landing');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Listing['category'] | 'Alle'>('Alle');
  const [searchLocation, setSearchLocation] = useState('');
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
    const matchesLocation = listing.location.toLowerCase().includes(searchLocation.toLowerCase());
    
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
  
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileCheckbox, setProfileCheckbox] = useState(false);
  
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
  const [newAddress, setNewAddress] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<{ label: string; coords: [number, number] }[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [selectedAddressCoords, setSelectedAddressCoords] = useState<[number, number] | null>(null);
  const [lastSelectedAddress, setLastSelectedAddress] = useState('');
  const [newFarmerName, setNewFarmerName] = useState('');

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
            setProfileEmail(profile.email || user.email || '');
            setProfilePhone(profile.phone || user.phoneNumber || '');
            setProfileAddress(profile.address || '');
            setIsAdmin(profile.role === 'admin');
          } else {
            setProfileEmail(user.email || '');
            setProfilePhone(user.phoneNumber || '');
            setProfileAddress('');
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

    return () => {
      unsubListings();
      unsubRequests();
    };
  }, [currentUser]);

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

  // Address Autocomplete Helper
  const handleAddressChange = (val: string) => {
    setNewAddress(val);
    setSelectedAddressCoords(null); // Clear precise coordinates because text was manually updated
  };

  const handleSelectAddress = (suggestion: { label: string; coords: [number, number] }) => {
    setNewAddress(suggestion.label);
    setLastSelectedAddress(suggestion.label);
    setSelectedAddressCoords(suggestion.coords);
    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
  };

  // Address autocomplete Swisstopo API query with 300ms debounce
  useEffect(() => {
    const cleanVal = newAddress.trim();
    if (cleanVal.length < 3) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    // Do not search if the value matches the last selected address suggestion
    if (lastSelectedAddress === cleanVal) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const url = `https://api3.geo.admin.ch/rest/services/ech/SearchServer?type=locations&origins=address&searchText=${encodeURIComponent(cleanVal)}&sr=4326&limit=6`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && data.results) {
            const suggestions = data.results.map((item: any) => {
              // Strip HTML tags like <b> from the search label
              const cleanLabel = item.attrs.label.replace(/<\/?[^>]+(>|$)/g, "").replace(/\s+/g, " ");
              return {
                label: cleanLabel,
                coords: [parseFloat(item.attrs.lat), parseFloat(item.attrs.lon)] as [number, number]
              };
            });
            setAddressSuggestions(suggestions);
            setShowAddressSuggestions(suggestions.length > 0);
          }
        }
      } catch (err) {
        console.warn("[HofTausch] Error fetching swisstopo address suggestions:", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [newAddress, lastSelectedAddress]);

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
        const url = `https://api3.geo.admin.ch/rest/services/ech/SearchServer?type=locations&origins=address&searchText=${encodeURIComponent(cleanVal)}&sr=4326&limit=6`;
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

  // Listing Handlers
  const handleStartEdit = (listing: Listing) => {
    setEditingListing(listing);
    setNewTitle(listing.title);
    setNewCategory(listing.category);
    setNewOffer(listing.descriptionOffer);
    setNewSeek(listing.descriptionSeek);
    setNewAddress(listing.location);
    setNewFarmerName(listing.farmerName);
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

  // Submission handler after user confirms their contact details in the modal
  const handleConfirmProfileAndSubmit = async () => {
    if (!currentUser) return;
    
    // Validate both fields
    const isEmailValid = validateProfileEmail(profileEmail);
    const isPhoneValid = validateProfilePhone(profilePhone);
    
    if (!isEmailValid || !isPhoneValid) {
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
      const profileData = {
        email: profileEmail.trim(),
        phone: profilePhone.trim(),
        address: profileAddress.trim(),
        confirmedAt: new Date().toISOString()
      };
      await saveUserProfile(currentUser.uid, profileData);

      // Build unified contact string for the database entry
      const contactString = `Tel: ${profilePhone.trim()} | E-Mail: ${profileEmail.trim()}${profileAddress.trim() ? ` | Adr: ${profileAddress.trim()}` : ''}`;
      const fullLocation = newAddress.trim();

      // 2. Execute the action
      if (pendingAction === 'create_listing') {
        const coords = selectedAddressCoords || getCoordinatesForLocation(fullLocation);

        if (editingListing) {
          // Update existing listing
          await updateListing(editingListing.id, {
            title: newTitle,
            category: newCategory,
            descriptionOffer: newOffer,
            descriptionSeek: newSeek,
            location: fullLocation,
            farmerName: newFarmerName,
            contact: contactString,
            coordinates: coords
          });
          showToast('Inserat erfolgreich aktualisiert!');
          setEditingListing(null);
        } else {
          // Create new listing
          const dateToday = new Date();
          const dateString = dateToday.toISOString().split('T')[0];
          const expiryDate = new Date(dateToday.getTime() + 21 * 24 * 60 * 60 * 1000);
          const expiryDateString = expiryDate.toISOString().split('T')[0];

          await addListing({
            title: newTitle,
            category: newCategory,
            descriptionOffer: newOffer,
            descriptionSeek: newSeek,
            location: fullLocation,
            farmerName: newFarmerName,
            contact: contactString,
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
        setNewAddress('');
        setNewFarmerName('');
        setActiveTab('my-listings');

      } else if (pendingAction === 'send_request') {
        if (!selectedListing) return;

        await addExchangeRequest({
          listingId: selectedListing.id,
          listingTitle: selectedListing.title,
          listingFarmerName: selectedListing.farmerName,
          offeredItem: reqOfferedItem,
          message: reqMessage,
          contactDetails: contactString,
          farmerName: reqFarmerName,
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
        setSelectedListing(null);
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
    if (!newTitle || !newOffer || !newSeek || !newAddress || !newFarmerName) {
      showToast('Bitte fülle alle Felder aus!', 'error');
      return;
    }

    // Intercept: Set pending action and open contact confirmation modal
    setPendingAction('create_listing');
    setShowConfirmContactModal(true);
  };

  const handleCancelCreateOrEdit = () => {
    setNewTitle('');
    setNewOffer('');
    setNewSeek('');
    setNewAddress('');
    setNewFarmerName('');
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
                <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Tauschbörse für die Schweiz 🇨🇭</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Handshake className="w-6 h-6" />
            </div>
            <div>
              <span className="font-display font-bold text-2xl tracking-tight text-stone-900">Hof<span className="text-emerald-600">Tausch</span></span>
              <p className="text-[10px] text-stone-500 font-semibold tracking-wider uppercase">Tauschbörse für Bauern 🇨🇭</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('landing')}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'landing' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Startseite
            </button>
            <button 
              onClick={() => setActiveTab('market')}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'market' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Marktplatz
            </button>
            <button 
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'create' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <PlusCircle className="w-4 h-4" /> Inserat erstellen
            </button>
            <button 
              onClick={() => setActiveTab('my-listings')}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 relative ${
                activeTab === 'my-listings' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Meine Inserate & Anfragen
              {requests.filter(r => listings.filter(l => l.userId === currentUser.uid).map(l => l.id).includes(r.listingId) && r.status === 'offen').length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] font-bold w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-white">
                  {requests.filter(r => listings.filter(l => l.userId === currentUser.uid).map(l => l.id).includes(r.listingId) && r.status === 'offen').length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('my-requests')}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'my-requests' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Gesendete Anfragen
            </button>
          </nav>

          {/* User profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-stone-200">
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
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-all duration-200"
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
            className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
              activeTab === 'landing' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            Startseite
          </button>
          <button 
            onClick={() => { setActiveTab('market'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
              activeTab === 'market' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            Marktplatz
          </button>
          <button 
            onClick={() => { setActiveTab('create'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'create' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <PlusCircle className="w-4 h-4" /> Inserat erstellen
          </button>
          <button 
            onClick={() => { setActiveTab('my-listings'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-between ${
              activeTab === 'my-listings' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span className="flex items-center gap-2">Meine Inserate & Anfragen</span>
            {requests.filter(r => listings.filter(l => l.userId === currentUser.uid).map(l => l.id).includes(r.listingId) && r.status === 'offen').length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {requests.filter(r => listings.filter(l => l.userId === currentUser.uid).map(l => l.id).includes(r.listingId) && r.status === 'offen').length}
              </span>
            )}
          </button>
          <button 
            onClick={() => { setActiveTab('my-requests'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
              activeTab === 'my-requests' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            Gesendete Anfragen
          </button>

          {/* User profile inside Mobile Menu on extra small screens */}
          <div className="sm:hidden pt-3 border-t border-stone-100 flex items-center gap-2 px-2">
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-stone-200" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs uppercase">
                {(currentUser.displayName || currentUser.email || 'B').charAt(0)}
              </div>
            )}
            <div className="text-left text-xs truncate">
              <p className="font-bold text-stone-800 truncate">{currentUser.displayName || 'Bauer'}</p>
              <p className="text-stone-400 truncate text-[10px]">{currentUser.email || currentUser.phoneNumber}</p>
            </div>
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
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3.5 py-1.5 rounded-full uppercase tracking-wider">HofTausch Schweiz 🇨🇭</span>
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
                    src={`${import.meta.env.BASE_URL}img/header.png`} 
                    alt="HofTausch Hero" 
                    className="w-full h-full object-cover"
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
                          {isOwn && (
                            <span className="absolute top-3 right-3 z-10 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                              Mein Inserat
                            </span>
                          )}
                          <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                                <img src={catStyle.icon} alt="" className="w-4 h-4" />
                                {listing.category}
                              </span>
                              <div className="flex flex-col items-end text-[10px] text-stone-400">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {listing.date}
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

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Standort</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                        <input 
                          type="text" 
                          placeholder="Ort oder PLZ..."
                          value={searchLocation}
                          onChange={(e) => setSearchLocation(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-white/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => { setSearchQuery(''); setSelectedCategory('Alle'); setSearchLocation(''); }}
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
          <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Hofname / Name</label>
                    <input 
                      type="text" 
                      placeholder="z.B. Tobler-Hof"
                      value={newFarmerName}
                      onChange={(e) => setNewFarmerName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Adresse / Standort (PLZ & Ort)</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="z.B. 8001 Zürich oder Bern"
                        value={newAddress}
                        onChange={(e) => handleAddressChange(e.target.value)}
                        onFocus={() => {
                          if (newAddress.trim().length > 0 && addressSuggestions.length > 0) {
                            setShowAddressSuggestions(true);
                          }
                        }}
                        onBlur={() => {
                          // delay hiding so that clicks on suggestions are registered
                          setTimeout(() => setShowAddressSuggestions(false), 200);
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 text-sm"
                        required
                        autoComplete="off"
                      />
                      
                      {showAddressSuggestions && addressSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto divide-y divide-stone-100">
                           {addressSuggestions.map((suggestion, idx) => (
                            <button
                              key={`${suggestion.label}-${idx}`}
                              type="button"
                              onClick={() => handleSelectAddress(suggestion)}
                              className="w-full px-4 py-3 text-left text-sm hover:bg-stone-50 text-stone-850 flex items-center justify-between transition-colors duration-150"
                            >
                              <span className="font-medium text-stone-800">{suggestion.label}</span>
                              <span className="text-xs text-stone-400">Schweiz 🇨🇭</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
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
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border flex items-center gap-1.5 ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                              <img src={catStyle.icon} alt="" className="w-4 h-4" />
                              {listing.category}
                            </span>
                            <span className="text-xs text-stone-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> Eingerichtet am {listing.date}
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
                      Inseriert am {selectedListing.date}
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

                {/* Adresse input (optional) with swisstopo autocomplete */}
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Adresse (Optional)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Strasse, Nr., PLZ, Ort (falls abweichend)"
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
                            <span className="text-xs text-stone-400">Schweiz 🇨🇭</span>
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

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 mt-16 border-t border-stone-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center text-emerald-500">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-white">Hof<span className="text-emerald-500">Tausch</span></span>
              <p className="text-[9px] text-stone-500 uppercase tracking-wider">Lokale Kooperation & Tauschbörse 🇨🇭</p>
            </div>
          </div>

          <div className="text-center md:text-right space-y-1">
            <p className="text-xs">Entwickelt für die moderne & nachhaltige Landwirtschaft.</p>
            <p className="text-[10px] text-stone-600">&copy; {new Date().getFullYear()} HofTausch. Simulierter Tauschdienst.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
