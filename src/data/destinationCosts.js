/**
 * Destination Expense Data
 * 
 * IMPORTANT:
 * These are ESTIMATED PLANNING COSTS for travel feasibility analysis.
 * They are approximate planning estimates and do NOT represent live booking
 * or guaranteed flight/hotel prices.
 */

export const destinationCosts = {
  Goa: {
    name: 'Goa',
    region: 'Western Coast, India',
    tagline: 'Sun-soaked beaches, vibrant nightlife, and heritage churches',
    lat: 15.2993,
    lon: 74.1240,
    travelPerPerson: 2500,
    hotelPerNight: 1800,
    foodPerPersonPerDay: 700,
    transportPerPersonPerDay: 250,
    activitiesPerPersonPerDay: 350,
    popularHighlights: ['Baga Beach', 'Fort Aguada', 'Water Sports', 'Anjuna Flea Market'],
    category: 'Beach & Leisure'
  },
  Hyderabad: {
    name: 'Hyderabad',
    region: 'Telangana, India',
    tagline: 'City of Pearls, iconic biryanis, and historic palaces',
    lat: 17.3850,
    lon: 78.4867,
    travelPerPerson: 1800,
    hotelPerNight: 1500,
    foodPerPersonPerDay: 550,
    transportPerPersonPerDay: 200,
    activitiesPerPersonPerDay: 250,
    popularHighlights: ['Charminar', 'Golconda Fort', 'Ramoji Film City', 'Hussain Sagar'],
    category: 'Heritage & Food'
  },
  Manali: {
    name: 'Manali',
    region: 'Himachal Pradesh, India',
    tagline: 'Snow-capped peaks, pine forests, and adventure sports',
    lat: 32.2432,
    lon: 77.1892,
    travelPerPerson: 3200,
    hotelPerNight: 2000,
    foodPerPersonPerDay: 650,
    transportPerPersonPerDay: 300,
    activitiesPerPersonPerDay: 500,
    popularHighlights: ['Solang Valley', 'Rohtang Pass', 'Old Manali', 'Hadimba Temple'],
    category: 'Mountains & Snow'
  },
  Jaipur: {
    name: 'Jaipur',
    region: 'Rajasthan, India',
    tagline: 'The Royal Pink City filled with forts, palaces, and bazaar colors',
    lat: 26.9124,
    lon: 75.7873,
    travelPerPerson: 2200,
    hotelPerNight: 1600,
    foodPerPersonPerDay: 500,
    transportPerPersonPerDay: 220,
    activitiesPerPersonPerDay: 300,
    popularHighlights: ['Hawa Mahal', 'Amber Palace', 'City Palace', 'Chokhi Dhani'],
    category: 'Royal Heritage'
  },
  Munnar: {
    name: 'Munnar',
    region: 'Kerala, India',
    tagline: 'Misty green tea estates, rolling hills, and cascading waterfalls',
    lat: 10.0889,
    lon: 77.0595,
    travelPerPerson: 2800,
    hotelPerNight: 1900,
    foodPerPersonPerDay: 550,
    transportPerPersonPerDay: 250,
    activitiesPerPersonPerDay: 300,
    popularHighlights: ['Tea Gardens', 'Anamudi Peak', 'Mattupetty Dam', 'Eravikulam'],
    category: 'Hill Station & Nature'
  },
  Mumbai: {
    name: 'Mumbai',
    region: 'Maharashtra, India',
    tagline: 'The dynamic City of Dreams, sea breeze, and colonial charm',
    lat: 19.0760,
    lon: 72.8777,
    travelPerPerson: 2600,
    hotelPerNight: 2800,
    foodPerPersonPerDay: 800,
    transportPerPersonPerDay: 350,
    activitiesPerPersonPerDay: 400,
    popularHighlights: ['Gateway of India', 'Marine Drive', 'Elephanta Caves', 'Bandra Fort'],
    category: 'Metropolis & Sea'
  },
  Udaipur: {
    name: 'Udaipur',
    region: 'Rajasthan, India',
    tagline: 'City of Lakes, romantic boat rides, and majestic marble architecture',
    lat: 24.5854,
    lon: 73.7125,
    travelPerPerson: 2700,
    hotelPerNight: 2200,
    foodPerPersonPerDay: 600,
    transportPerPersonPerDay: 220,
    activitiesPerPersonPerDay: 350,
    popularHighlights: ['Lake Pichola', 'City Palace', 'Jag Mandir', 'Fateh Sagar'],
    category: 'Romance & Lakes'
  },
  Varanasi: {
    name: 'Varanasi',
    region: 'Uttar Pradesh, India',
    tagline: 'Spiritual heart of India, ancient ghats, and mesmerizing evening aartis',
    lat: 25.3176,
    lon: 82.9739,
    travelPerPerson: 2000,
    hotelPerNight: 1400,
    foodPerPersonPerDay: 450,
    transportPerPersonPerDay: 180,
    activitiesPerPersonPerDay: 200,
    popularHighlights: ['Dashashwamedh Ghat', 'Kashi Vishwanath', 'Assi Ghat', 'Sarnath'],
    category: 'Spiritual & Culture'
  },
  Rishikesh: {
    name: 'Rishikesh',
    region: 'Uttarakhand, India',
    tagline: 'Yoga capital of the world, river rafting, and serene Himalayan vistas',
    lat: 30.0869,
    lon: 78.2676,
    travelPerPerson: 2400,
    hotelPerNight: 1600,
    foodPerPersonPerDay: 500,
    transportPerPersonPerDay: 200,
    activitiesPerPersonPerDay: 600,
    popularHighlights: ['White Water Rafting', 'Lakshman Jhula', 'Beatles Ashram', 'Ganga Aarti'],
    category: 'Adventure & Wellness'
  },
  Ooty: {
    name: 'Ooty',
    region: 'Tamil Nadu, India',
    tagline: 'Queen of Hill Stations, eucalyptus groves, and heritage toy train',
    lat: 11.4102,
    lon: 76.6950,
    travelPerPerson: 2500,
    hotelPerNight: 1700,
    foodPerPersonPerDay: 500,
    transportPerPersonPerDay: 220,
    activitiesPerPersonPerDay: 250,
    popularHighlights: ['Botanical Gardens', 'Ooty Lake', 'Doddabetta Peak', 'Nilgiri Toy Train'],
    category: 'Hill Station'
  },
  Andaman: {
    name: 'Andaman & Nicobar',
    region: 'Union Territory, India',
    tagline: 'Turquoise waters, coral reefs, and untouched tropical islands',
    lat: 11.6234,
    lon: 92.7265,
    travelPerPerson: 7500,
    hotelPerNight: 3000,
    foodPerPersonPerDay: 900,
    transportPerPersonPerDay: 400,
    activitiesPerPersonPerDay: 1200,
    popularHighlights: ['Radhanagar Beach', 'Scuba Diving', 'Cellular Jail', 'Havelock Island'],
    category: 'Islands & Marine'
  },
  Ladakh: {
    name: 'Leh Ladakh',
    region: 'Union Territory, India',
    tagline: 'High-altitude cold desert, crystal blue lakes, and ancient monasteries',
    lat: 34.1526,
    lon: 77.5771,
    travelPerPerson: 6500,
    hotelPerNight: 2600,
    foodPerPersonPerDay: 750,
    transportPerPersonPerDay: 600,
    activitiesPerPersonPerDay: 500,
    popularHighlights: ['Pangong Lake', 'Nubra Valley', 'Khardung La', 'Thiksey Monastery'],
    category: 'High Altitude Adventure'
  },
  Dubai: {
    name: 'Dubai',
    region: 'United Arab Emirates',
    tagline: 'Futuristic architecture, luxury shopping, and desert safaris',
    lat: 25.2048,
    lon: 55.2708,
    travelPerPerson: 18000,
    hotelPerNight: 6500,
    foodPerPersonPerDay: 2200,
    transportPerPersonPerDay: 800,
    activitiesPerPersonPerDay: 1800,
    popularHighlights: ['Burj Khalifa', 'Desert Safari', 'Dubai Mall', 'Palm Jumeirah'],
    category: 'International'
  },
  Bali: {
    name: 'Bali',
    region: 'Indonesia',
    tagline: 'Lush rice terraces, spiritual temples, and tropical surf beaches',
    lat: -8.4095,
    lon: 115.1889,
    travelPerPerson: 22000,
    hotelPerNight: 3500,
    foodPerPersonPerDay: 1200,
    transportPerPersonPerDay: 500,
    activitiesPerPersonPerDay: 1000,
    popularHighlights: ['Ubud Monkey Forest', 'Tanah Lot', 'Tegallalang', 'Seminyak Beach'],
    category: 'International'
  },
  Singapore: {
    name: 'Singapore',
    region: 'Southeast Asia',
    tagline: 'Garden city with iconic skylines, world-class theme parks, and street dining',
    lat: 1.3521,
    lon: 103.8198,
    travelPerPerson: 20000,
    hotelPerNight: 7500,
    foodPerPersonPerDay: 2000,
    transportPerPersonPerDay: 700,
    activitiesPerPersonPerDay: 2200,
    popularHighlights: ['Gardens by the Bay', 'Marina Bay Sands', 'Universal Studios', 'Sentosa'],
    category: 'International'
  },
  Bangkok: {
    name: 'Bangkok',
    region: 'Thailand',
    tagline: 'Ornate shrines, bustling floating markets, and legendary street food',
    lat: 13.7563,
    lon: 100.5018,
    travelPerPerson: 16000,
    hotelPerNight: 3000,
    foodPerPersonPerDay: 1100,
    transportPerPersonPerDay: 450,
    activitiesPerPersonPerDay: 900,
    popularHighlights: ['Grand Palace', 'Wat Arun', 'Chatuchak Market', 'Chao Phraya River'],
    category: 'International'
  }
};

export const destinationList = Object.keys(destinationCosts).map(key => ({
  id: key,
  ...destinationCosts[key]
}));

export const getDestinationByName = (name) => {
  if (!name) return null;
  const normalized = name.trim().toLowerCase();
  const match = Object.keys(destinationCosts).find(
    key => key.toLowerCase() === normalized || 
           destinationCosts[key].name.toLowerCase() === normalized
  );
  return match ? destinationCosts[match] : null;
};
