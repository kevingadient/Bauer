import type { Listing, ExchangeRequest } from './types';

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'l1',
    title: '10x Heu-Rundballen (Ernte 2026)',
    category: 'Futter',
    descriptionOffer: 'Biete 10 Heu-Rundballen, trocken gelagert, Hallenware, hervorragende Qualität (1. Schnitt 2026). Bestens geeignet für Pferde oder Milchvieh.',
    descriptionSeek: 'Suche Unterstützung beim Mähen einer 2 Hektar Wiese (Traktor ist vorhanden, aber wir benötigen ein Mähwerk samt Fahrer) oder Tausch gegen 2 Raummeter trockenes Hartholz-Brennholz.',
    location: '8360 Wallisel (Zürich)',
    farmerName: 'Bio-Hof Tobler',
    contact: '+41 79 123 45 67 | info@tobler-bio.ch',
    date: '2026-07-12',
    expiryDate: '2026-08-02',
    coordinates: [47.3769, 8.5417]
  },
  {
    id: 'l2',
    title: 'Zweiachs-Kipper / Anhänger (8t) zur Leihe',
    category: 'Maschinen',
    descriptionOffer: 'Biete unseren gut gepflegten Zweiachs-Dreiseitenkipper (8 Tonnen Gesamtgewicht) zur Leihe für die anstehende Getreide- oder Rübenernte (Dauer ca. 2-3 Wochen nach Absprache).',
    descriptionSeek: 'Suche im Gegenzug ca. 5 Säcke zertifiziertes Winterweizen-Saatgut für die Aussaat im Herbst oder Hilfe beim Einstreuen unseres neuen Rinderstalls.',
    location: '3011 Bern',
    farmerName: 'Hof Tschumi',
    contact: 'tschumi-landbau@gmx.ch',
    date: '2026-07-10',
    expiryDate: '2026-07-31',
    coordinates: [46.9480, 7.4474]
  },
  {
    id: 'l3',
    title: '50kg Bio-Saatkartoffeln (Sorte "Linda")',
    category: 'Saatgut',
    descriptionOffer: 'Biete 50kg zertifizierte, kellergelagerte Bio-Saatkartoffeln der beliebten, festkochenden Sorte "Linda". Keimlinge entwickeln sich prächtig.',
    descriptionSeek: 'Suche Tausch gegen Schafwoll-Pellets als Langzeitdünger (ca. 25kg) oder 3 Kisten Bio-Äpfel aus der Region.',
    location: '6003 Luzern',
    farmerName: 'Milchhof Odermatt',
    contact: '+41 41 987 65 43 | kontakt@odermatt-hof.ch',
    date: '2026-07-14',
    expiryDate: '2026-08-04',
    coordinates: [47.0502, 8.3093],
    userId: 'demo_user' // So this listing belongs to user to demonstrate "my listings"
  },
  {
    id: 'l4',
    title: 'Gesiebter Qualitäts-Kompost (1 Tonne)',
    category: 'Dünger',
    descriptionOffer: 'Biete up to 1 Tonne feinen, gesiebten Kompost aus eigener Rindermist- und Grüngutkompostierung. Ideal für Gemüsebau oder Bodenverbesserung.',
    descriptionSeek: 'Suche frische Freilandeier (wöchentliche Abgabe im Tausch) oder Speisekürbisse (Hokkaido, Butternut) für unseren Hofladen.',
    location: '9000 St. Gallen',
    farmerName: 'Chäshütte Vetsch',
    contact: 'vetsch-stgallen@bluewin.ch',
    date: '2026-07-13',
    expiryDate: '2026-08-03',
    coordinates: [47.4239, 9.3748],
    userId: 'demo_user'
  },
  {
    id: 'l5',
    title: 'Hilfe bei Zaunbau & Weidepflege',
    category: 'Dienstleistung',
    descriptionOffer: 'Biete 2 Tage tatkräftige Unterstützung im Zaunbau. Ich bringe eine Pfahlramme und Handwerkzeug mit. Ideal, um Weidezäune winterfest zu machen oder neu anzulegen.',
    descriptionSeek: 'Suche ca. 15 kleine, gepresste HD-Strohballen (Gerste oder Weizen, trocken gelagert) für unseren Hühnerstall.',
    location: '8400 Winterthur',
    farmerName: 'Weinbau Keller',
    contact: '+41 52 555 44 33',
    date: '2026-07-11',
    expiryDate: '2026-08-01',
    coordinates: [47.5026, 8.7291]
  },
  {
    id: 'l6',
    title: 'Zucht-Widder (Coburger Fuchsschaf)',
    category: 'Tiere',
    descriptionOffer: 'Biete einen kräftigen, reinrassigen Zuchtwidder (Alter: 1,5 Jahre) der bedrohten Haustierrasse "Coburger Fuchsschaf". Sehr friedfertig und deckfreudig.',
    descriptionSeek: 'Suche Tausch gegen 2 weibliche Coburger Fuchsschaf-Lämmer zur Blutauffrischung unserer Herde.',
    location: '1003 Lausanne',
    farmerName: 'Ferme du Vallon',
    contact: 'info@ferme-du-vallon.ch',
    date: '2026-07-09',
    expiryDate: '2026-07-30',
    coordinates: [46.5197, 6.6323]
  },
  {
    id: 'l7',
    title: 'Abgelaufenes Inserat (HD-Strohballen) - Demonstration',
    category: 'Futter',
    descriptionOffer: 'Biete 20 kleine HD-Strohballen von letztem Jahr.',
    descriptionSeek: 'Suche Tausch gegen 1 Kiste Gemüse.',
    location: '8001 Zürich',
    farmerName: 'Althof Meier',
    contact: 'meier@althof.ch',
    date: '2026-06-01',
    expiryDate: '2026-06-22', // Expired! Should not be visible on the market
    coordinates: [47.3769, 8.5417]
  }
];

export const INITIAL_REQUESTS: ExchangeRequest[] = [
  {
    id: 'r1',
    listingId: 'l1',
    listingTitle: '10x Heu-Rundballen (Ernte 2026)',
    listingFarmerName: 'Bio-Hof Tobler',
    offeredItem: 'Unterstützung beim Mähen & Mähwerk',
    message: 'Grüezi Familie Tobler, wir haben ein passendes 3m-Scheibenmähwerk und könnten das Mähen eurer 2 Hektar übernehmen. Wir würden dafür gerne die 10 Heu-Rundballen nehmen. Passt das zeitlich nächste Woche bei euch?',
    contactDetails: '+41 78 777 88 99 | info@schmid-agrar.ch',
    farmerName: 'Lohnunternehmen Schmid',
    status: 'offen',
    date: '2026-07-13',
    senderId: 'request_sender_1',
    receiverId: 'demo_user'
  },
  {
    id: 'r2',
    listingId: 'l4',
    listingTitle: 'Gesiebter Qualitäts-Kompost (1 Tonne)',
    listingFarmerName: 'Chäshütte Vetsch',
    offeredItem: 'Freilandeier & Kürbisse',
    message: 'Hallo Herr Vetsch, wir können euch ab sofort wöchentlich 30 frische Freilandeier liefern sowie im Herbst ca. 20 Hokkaido-Kürbisse vorbeibringen. Im Gegenzug würden wir gerne die Tonne Kompost abholen kommen.',
    contactDetails: 'bio-ei-eder@gmx.ch',
    farmerName: 'Geflügelhof Eder',
    status: 'akzeptiert',
    date: '2026-07-14',
    senderId: 'request_sender_2',
    receiverId: 'demo_user'
  }
];
