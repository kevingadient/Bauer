export interface Listing {
  id: string;
  title: string;
  category: 'Futter' | 'Saatgut' | 'Maschinen' | 'Tiere' | 'Dienstleistung' | 'Dünger' | 'Sonstiges';
  descriptionOffer: string;
  descriptionSeek: string;
  location: string;
  farmerName: string;
  contact: string;
  date: string;
  image?: string;
  userId?: string; // Firebase user ID of listing owner
  coordinates?: [number, number]; // [latitude, longitude] for maps
  expiryDate?: string; // Expiration date (YYYY-MM-DD)
}

export interface ExchangeRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  listingFarmerName: string;
  offeredItem: string;
  message: string;
  contactDetails: string;
  farmerName: string;
  status: 'offen' | 'akzeptiert' | 'abgelehnt';
  date: string;
  senderId?: string; // Firebase user ID of request sender
  receiverId?: string; // Firebase user ID of listing owner
}
