export const API_BASE_URL = 'http://localhost:60247/api';

export const getTripImage = (trip) => {
  if (!trip) return '';
  if (trip.zdjecieGlowne) {
    return `data:image/jpeg;base64,${trip.zdjecieGlowne}`;
  }
  
  const city = (trip.miasto || '').toLowerCase();
  const country = (trip.kraj || '').toLowerCase();
  
  if (city.includes('ateny') || country.includes('grecj')) {
    return 'https://images.unsplash.com/photo-1503152394-c571994fd383?auto=format&fit=crop&w=600&q=80';
  }
  if (city.includes('rzym') || country.includes('włoch')) {
    return 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80';
  }
  if (city.includes('bali') || country.includes('indonez')) {
    return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80';
  }
  if (city.includes('paryż') || city.includes('paris') || country.includes('franc')) {
    return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80';
  }
  if (city.includes('tokio') || city.includes('tokyo') || country.includes('japon')) {
    return 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80';
  }
  if (city.includes('alp') || country.includes('szwajc')) {
    return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80';
  }
  if (city.includes('kair') || city.includes('cairo') || country.includes('egipt')) {
    return 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80';
  }
  if (city.includes('bergen') || country.includes('norweg')) {
    return 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=600&q=80';
  }
  if (city.includes('nairobi') || country.includes('keni')) {
    return 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80';
  }
  if (city.includes('jork') || city.includes('york') || country.includes('usa')) {
    return 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80';
  }
  if (city.includes('marrakesz') || city.includes('marrakech') || country.includes('marok')) {
    return 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=600&q=80';
  }
  if (city.includes('male') || country.includes('malediw')) {
    return 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80';
  }
  if (city.includes('reykjavik') || country.includes('island')) {
    return 'https://images.unsplash.com/photo-1504893524553-ac55fce69cbf?auto=format&fit=crop&w=600&q=80';
  }
  
  // General fallback
  return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';
};
