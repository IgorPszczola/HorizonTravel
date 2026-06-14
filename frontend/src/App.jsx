import { useState, useEffect } from 'react';
import './App.css';

// Using HTTP port to avoid local self-signed SSL certificate issues in browser
const API_BASE_URL = 'http://localhost:60247/api';

function App() {
  // Authentication & User state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Navigation state: 'trips' | 'bookings' | 'admin'
  const [activeTab, setActiveTab] = useState('trips');

  // Modal states
  const [authModal, setAuthModal] = useState({ isOpen: false, tab: 'login' }); // 'login' | 'register'
  const [selectedTrip, setSelectedTrip] = useState(null); // Trip details modal
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, bookingId: null, amount: 0 });

  // Data states
  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [tripReviews, setTripReviews] = useState([]);

  // Filters state
  const [searchCountry, setSearchCountry] = useState('');
  const [sortByPrice, setSortByPrice] = useState(''); // '' | 'asc' | 'desc'

  // Form states
  const [authForm, setAuthForm] = useState({ email: '', password: '', imie: '', nazwisko: '' });
  const [bookingForm, setBookingForm] = useState({ participants: 1 });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [paymentForm, setPaymentForm] = useState({ method: 'Karta' });

  // Admin form state
  const [adminActiveSubTab, setAdminActiveSubTab] = useState('list'); // 'list' | 'add' | 'stats'
  const [tripForm, setTripForm] = useState({
    id: null, // null for create, number for edit
    tytul: '',
    kraj: '',
    miasto: '',
    opis: '',
    maxPlaces: 15,
    price: 1500,
    startDate: '',
    endDate: '',
    image: null,
    imagePreview: null
  });

  // Admin statistics
  const [statsRevenue, setStatsRevenue] = useState([]);
  const [statsPopular, setStatsPopular] = useState([]);

  // Charts Modal State
  const [showChartsModal, setShowChartsModal] = useState(false);
  const [hoveredData, setHoveredData] = useState(null);
  const [chartsActiveTab, setChartsActiveTab] = useState('revenue');

  // Toast Notifications
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Fetch Trips
  const fetchTrips = async () => {
    setLoadingTrips(true);
    try {
      let url = `${API_BASE_URL}/trips`;
      const params = [];
      if (searchCountry) params.push(`kraj=${encodeURIComponent(searchCountry)}`);
      if (sortByPrice) params.push(`sortujPoCenie=${sortByPrice}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
      } else {
        showToast('Nie udało się pobrać wycieczek', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Błąd połączenia z serwerem wycieczek', 'error');
    } finally {
      setLoadingTrips(false);
    }
  };

  // Fetch User Bookings
  const fetchMyBookings = async () => {
    if (!user) return;
    setLoadingBookings(true);
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/my/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMyBookings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Fetch Stats for Admin
  const fetchAdminStats = async () => {
    if (!user || user.rola !== 'Admin') return;
    try {
      const headers = { 'Authorization': `Bearer ${user.token}` };
      
      // Fetch popular trips
      const resPopular = await fetch(`${API_BASE_URL}/stats/popular-trips`, { headers });
      if (resPopular.ok) {
        const data = await resPopular.json();
        setStatsPopular(data);
      }

      // Fetch revenue
      const resRev = await fetch(`${API_BASE_URL}/stats/monthly-revenue`, { headers });
      if (resRev.ok) {
        const data = await resRev.json();
        setStatsRevenue(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Reviews for selected trip
  const fetchTripReviews = async (tripId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/trip/${tripId}`);
      if (res.ok) {
        const data = await res.json();
        setTripReviews(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger fetches
  useEffect(() => {
    fetchTrips();
  }, [searchCountry, sortByPrice]);

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchMyBookings();
    } else if (activeTab === 'admin' && adminActiveSubTab === 'stats') {
      fetchAdminStats();
    }
  }, [activeTab, adminActiveSubTab]);

  // Auth: Register/Login
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const isLogin = authModal.tab === 'login';
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin 
      ? { email: authForm.email, password: authForm.password }
      : { email: authForm.email, password: authForm.password, imie: authForm.imie, nazwisko: authForm.nazwisko };

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
          setAuthModal(prev => ({ ...prev, isOpen: false }));
          showToast(`Witaj z powrotem, ${data.imie}!`, 'success');
          // Clear inputs
          setAuthForm({ email: '', password: '', imie: '', nazwisko: '' });
        } else {
          showToast('Konto zostało zarejestrowane! Zaloguj się teraz.', 'success');
          setAuthModal(prev => ({ ...prev, tab: 'login' }));
        }
      } else {
        showToast(data.message || 'Wystąpił błąd autoryzacji', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Błąd połączenia z serwerem autoryzacji', 'error');
    }
  };

  // Logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setActiveTab('trips');
    showToast('Zostałeś pomyślnie wylogowany', 'success');
  };

  // Booking Create
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setAuthModal({ isOpen: true, tab: 'login' });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          wycieczkaId: selectedTrip.id,
          uzytkownikId: user.id,
          liczbaUczestnikow: bookingForm.participants
        })
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Zarezerwowano pomyślnie! Przejdź do zakładki Rezerwacje, aby opłacić.', 'success');
        setSelectedTrip(null);
        setActiveTab('bookings');
        fetchTrips(); // Aktualizuj wolne miejsca na żywo
        if (user && user.rola === 'Admin') fetchAdminStats();
      } else {
        showToast(data.message || 'Nie udało się dokonać rezerwacji', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Błąd serwera podczas rezerwacji', 'error');
    }
  };

  // Booking Payment
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${paymentModal.bookingId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          metodaPlatnosci: paymentForm.method
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Płatność zakończona pomyślnie!', 'success');
        setPaymentModal(prev => ({ ...prev, isOpen: false }));
        fetchMyBookings();
        fetchTrips(); // Aktualizuj wolne miejsca na żywo
        if (user && user.rola === 'Admin') fetchAdminStats();
      } else {
        showToast(data.message || 'Płatność odrzucona', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Błąd połączenia z bankiem płatności', 'error');
    }
  };

  // Review Create
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          wycieczkaId: selectedTrip.id,
          uzytkownikId: user.id,
          ocena: reviewForm.rating,
          komentarz: reviewForm.comment
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Opinia została dodana!', 'success');
        setReviewForm({ rating: 5, comment: '' });
        fetchTripReviews(selectedTrip.id);
      } else {
        showToast(data.message || 'Nie udało się dodać opinii', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Błąd serwera przy dodawaniu opinii', 'error');
    }
  };

  // Admin Trip Create or Edit
  const handleTripFormSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('tytul', tripForm.tytul);
    formData.append('kraj', tripForm.kraj);
    formData.append('miasto', tripForm.miasto);
    formData.append('opis', tripForm.opis);
    formData.append('maksymalnaLiczbaMiejsc', tripForm.maxPlaces.toString());
    formData.append('aktualnaCena', tripForm.price.toString());
    formData.append('dataRozpoczecia', tripForm.startDate);
    formData.append('dataZakonczenia', tripForm.endDate);
    
    if (tripForm.image) {
      formData.append('zdjecieGlowne', tripForm.image);
    }

    const isEdit = tripForm.id !== null;
    const url = isEdit 
      ? `${API_BASE_URL}/trips/${tripForm.id}`
      : `${API_BASE_URL}/trips`;

    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      if (res.ok) {
        showToast(isEdit ? 'Wycieczka zaktualizowana' : 'Dodano nową wycieczkę!', 'success');
        setTripForm({
          id: null,
          tytul: '',
          kraj: '',
          miasto: '',
          opis: '',
          maxPlaces: 15,
          price: 1500,
          startDate: '',
          endDate: '',
          image: null,
          imagePreview: null
        });
        setAdminActiveSubTab('list');
        fetchTrips();
        if (user && user.rola === 'Admin') fetchAdminStats();
      } else {
        const data = await res.json();
        showToast(data.message || 'Wystąpił błąd zapisu wycieczki', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Błąd połączenia podczas zapisywania wycieczki', 'error');
    }
  };

  // Admin Trip Delete
  const handleTripDelete = async (tripId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę wycieczkę?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (res.ok) {
        showToast('Wycieczka została usunięta', 'success');
        fetchTrips();
        if (user && user.rola === 'Admin') fetchAdminStats();
      } else {
        showToast('Nie można usunąć wycieczki', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Błąd połączenia z serwerem', 'error');
    }
  };

  // Prepare Edit Form
  const startEditTrip = (trip) => {
    // Parse Dates to yyyy-MM-dd
    const parseDate = (dStr) => {
      const date = new Date(dStr);
      return date.toISOString().split('T')[0];
    };

    setTripForm({
      id: trip.id,
      tytul: trip.tytul,
      kraj: trip.kraj,
      miasto: trip.miasto,
      opis: trip.opis,
      maxPlaces: trip.maksymalnaLiczbaMiejsc,
      price: trip.aktualnaCena,
      startDate: parseDate(trip.dataRozpoczecia),
      endDate: parseDate(trip.dataZakonczenia),
      image: null,
      imagePreview: trip.zdjecieGlowne ? `data:image/jpeg;base64,${trip.zdjecieGlowne}` : null
    });
    setAdminActiveSubTab('add');
  };

  // Open Trip Details
  const handleOpenTripDetails = (trip) => {
    setSelectedTrip(trip);
    fetchTripReviews(trip.id);
    setBookingForm({ participants: 1 });
    setReviewForm({ rating: 5, comment: '' });
  };

  // Handle Image Upload change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTripForm(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <header className="navbar">
        <div className="logo" onClick={() => setActiveTab('trips')}>
          <i className="fa-solid fa-compass"></i> HorizonTravel
        </div>

        <ul className="nav-links">
          <li>
            <button 
              className={`nav-btn ${activeTab === 'trips' ? 'active' : ''}`}
              onClick={() => setActiveTab('trips')}
            >
              Wycieczki
            </button>
          </li>
          {user && (
            <li>
              <button 
                className={`nav-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                Rezerwacje
              </button>
            </li>
          )}
          {user && user.rola === 'Admin' && (
            <li>
              <button 
                className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('admin');
                  setAdminActiveSubTab('list');
                }}
              >
                Panel Admina
              </button>
            </li>
          )}

          <div className="nav-user">
            {user ? (
              <>
                <div className="user-badge">
                  <span className="user-name">{user.imie} {user.nazwisko}</span>
                  <span className="user-role">{user.rola === 'Admin' ? 'Administrator' : 'Klient'}</span>
                </div>
                <button className="btn btn-outline" onClick={handleLogout}>
                  Wyloguj <i className="fa-solid fa-right-from-bracket"></i>
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => setAuthModal({ isOpen: true, tab: 'login' })}>
                Logowanie <i className="fa-solid fa-right-to-bracket"></i>
              </button>
            )}
          </div>
        </ul>
      </header>

      {/* Main Views Container */}
      <main>
        {activeTab === 'trips' && (
          <div className="animate-fade-in">
            {/* Hero Banner */}
            <section className="hero">
              <h1 className="hero-title">
                Odkryj Swoją <span className="gradient-text">Następną Przygodę</span>
              </h1>
              <p className="hero-subtitle">
                Zarezerwuj ekskluzywne wycieczki w najpiękniejsze zakątki globu. Doświadcz luksusu i niezapomnianych chwil z HorizonTravel.
              </p>

              {/* Filters & Searching */}
              <div className="filters-bar">
                <div className="search-input-wrapper">
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Wyszukaj kraj..." 
                    value={searchCountry}
                    onChange={(e) => setSearchCountry(e.target.value)}
                  />
                </div>
                
                <select 
                  className="filter-select"
                  value={sortByPrice}
                  onChange={(e) => setSortByPrice(e.target.value)}
                >
                  <option value="">Sortuj po cenie</option>
                  <option value="asc">Cena: rosnąco</option>
                  <option value="desc">Cena: malejąco</option>
                </select>
              </div>
            </section>

            {/* Trips Grid */}
            <h2 className="trips-section-title">
              <i className="fa-solid fa-earth-europe" style={{color: 'var(--primary)'}}></i> Dostępne Wycieczki
            </h2>

            {loadingTrips ? (
              <div style={{ padding: '60px 0' }}>
                <span className="loader"></span>
                <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Ładowanie wycieczek...</p>
              </div>
            ) : trips.length === 0 ? (
              <div className="glass-panel" style={{ padding: '40px', color: 'var(--text-secondary)' }}>
                Brak dostępnych wycieczek spełniających kryteria.
              </div>
            ) : (
              <div className="trips-grid">
                {trips.map(trip => (
                  <div key={trip.id} className="glass-panel trip-card">
                    <div className="trip-image-container">
                      {trip.zdjecieGlowne ? (
                        <img 
                          src={`data:image/jpeg;base64,${trip.zdjecieGlowne}`} 
                          alt={trip.tytul}
                          className="trip-image"
                        />
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                          <i className="fa-solid fa-image fa-3x"></i>
                        </div>
                      )}
                      <div className="trip-badge">
                        <i className="fa-solid fa-location-dot"></i> {trip.kraj}
                      </div>
                    </div>

                    <div className="trip-card-content">
                      <div className="trip-card-header">
                        <h3 className="trip-card-title">{trip.tytul}</h3>
                        <span className="trip-card-price">{trip.aktualnaCena} zł</span>
                      </div>
                      
                      <p className="trip-card-desc">{trip.opis}</p>
                      
                      <div className="trip-card-meta">
                        <span>
                          <i className="fa-solid fa-calendar-days"></i> {new Date(trip.dataRozpoczecia).toLocaleDateString('pl-PL')}
                        </span>
                        <span>
                          <i className="fa-solid fa-clock"></i> {Math.ceil((new Date(trip.dataZakonczenia) - new Date(trip.dataRozpoczecia)) / (1000 * 60 * 60 * 24))} dni
                        </span>
                      </div>

                      <button 
                        className="btn btn-primary" 
                        style={{ marginTop: '20px', width: '100%' }}
                        onClick={() => handleOpenTripDetails(trip)}
                      >
                        Zobacz szczegóły <i className="fa-solid fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Bookings View */}
        {activeTab === 'bookings' && user && (
          <div className="animate-fade-in">
            <h2 className="trips-section-title" style={{ marginBottom: '32px' }}>
              <i className="fa-solid fa-suitcase-rolling" style={{color: 'var(--primary)'}}></i> Twoje Rezerwacje
            </h2>

            {loadingBookings ? (
              <div style={{ padding: '60px 0' }}>
                <span className="loader"></span>
              </div>
            ) : myBookings.length === 0 ? (
              <div className="glass-panel" style={{ padding: '50px', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                <i className="fa-solid fa-folder-open fa-2x" style={{ marginBottom: '16px', display: 'block', color: 'var(--text-muted)' }}></i>
                Nie dokonałeś jeszcze żadnych rezerwacji.
              </div>
            ) : (
              <div className="bookings-list">
                {myBookings.map(booking => (
                  <div key={booking.id} className="glass-panel booking-item">
                    <div className="booking-item-left">
                      <h3 className="booking-trip-title">{booking.wycieczka?.tytul}</h3>
                      <p className="booking-trip-dates">
                        <i className="fa-solid fa-location-dot"></i> {booking.wycieczka?.miasto}, {booking.wycieczka?.kraj} &bull; <i className="fa-solid fa-calendar"></i> {new Date(booking.wycieczka?.dataRozpoczecia).toLocaleDateString('pl-PL')} - {new Date(booking.wycieczka?.dataZakonczenia).toLocaleDateString('pl-PL')}
                      </p>
                      <div className="booking-meta-line">
                        <span>Osoby: <strong>{booking.liczbaUczestnikow}</strong></span>
                        <span>
                          Status:{' '}
                          <span className={`booking-status-badge ${booking.status === 'Opłacona' ? 'paid' : 'pending'}`}>
                            {booking.status}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="booking-item-right">
                      <span className="booking-item-price">{booking.sumarycznaCena} zł</span>
                      {booking.status !== 'Opłacona' ? (
                        <button 
                          className="btn btn-secondary"
                          onClick={() => setPaymentModal({ isOpen: true, bookingId: booking.id, amount: booking.sumarycznaCena })}
                        >
                          Kupuję i Płacę <i className="fa-solid fa-credit-card"></i>
                        </button>
                      ) : (
                        <button className="btn btn-outline" disabled style={{ opacity: 0.6, cursor: 'default' }}>
                          Zapłacono <i className="fa-solid fa-circle-check" style={{color: '#10b981'}}></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Admin Dashboard */}
        {activeTab === 'admin' && user && user.rola === 'Admin' && (
          <div className="animate-fade-in" style={{ textAlign: 'left' }}>
            <h2 className="trips-section-title" style={{ marginBottom: '32px' }}>
              <i className="fa-solid fa-user-shield" style={{color: 'var(--primary)'}}></i> Panel Administratora
            </h2>

            {/* Admin Tabs */}
            <div className="admin-tabs">
              <button 
                className={`admin-tab ${adminActiveSubTab === 'list' ? 'active' : ''}`}
                onClick={() => setAdminActiveSubTab('list')}
              >
                <i className="fa-solid fa-list"></i> Zarządzaj Wycieczkami
              </button>
              <button 
                className={`admin-tab ${adminActiveSubTab === 'add' ? 'active' : ''}`}
                onClick={() => {
                  setTripForm({
                    id: null,
                    tytul: '',
                    kraj: '',
                    miasto: '',
                    opis: '',
                    maxPlaces: 15,
                    price: 1500,
                    startDate: '',
                    endDate: '',
                    image: null,
                    imagePreview: null
                  });
                  setAdminActiveSubTab('add');
                }}
              >
                <i className="fa-solid fa-plus"></i> Dodaj Wycieczkę
              </button>
              <button 
                className={`admin-tab ${adminActiveSubTab === 'stats' ? 'active' : ''}`}
                onClick={() => setAdminActiveSubTab('stats')}
              >
                <i className="fa-solid fa-chart-line"></i> Statystyki i Finanse
              </button>
            </div>

            {/* Sub View: List trips to manage */}
            {adminActiveSubTab === 'list' && (
              <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
                <table className="admin-trips-table">
                  <thead>
                    <tr>
                      <th>Wycieczka</th>
                      <th>Kierunek</th>
                      <th>Cena</th>
                      <th>Miejsca</th>
                      <th>Termin</th>
                      <th>Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trips.map(trip => (
                      <tr key={trip.id}>
                        <td style={{ fontWeight: 600 }}>{trip.tytul}</td>
                        <td>{trip.miasto}, {trip.kraj}</td>
                        <td style={{ color: 'var(--secondary)', fontWeight: 600 }}>{trip.aktualnaCena} zł</td>
                        <td>{trip.maksymalnaLiczbaMiejsc}</td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {new Date(trip.dataRozpoczecia).toLocaleDateString('pl-PL')}
                        </td>
                        <td>
                          <div className="admin-table-actions">
                            <button className="btn btn-outline" onClick={() => startEditTrip(trip)}>
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button className="btn btn-danger" onClick={() => handleTripDelete(trip.id)}>
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sub View: Add/Edit Trip */}
            {adminActiveSubTab === 'add' && (
              <div className="glass-panel" style={{ padding: '40px', maxWidth: '750px' }}>
                <h3 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>
                  {tripForm.id ? 'Edytuj Wycieczkę' : 'Dodaj Nową Wycieczkę'}
                </h3>
                
                <form onSubmit={handleTripFormSubmit}>
                  <div className="form-group">
                    <label className="form-label">Tytuł Wycieczki</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      required 
                      value={tripForm.tytul}
                      onChange={(e) => setTripForm(prev => ({ ...prev, tytul: e.target.value }))}
                      placeholder="np. Słoneczna Grecja"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">Kraj</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        required 
                        value={tripForm.kraj}
                        onChange={(e) => setTripForm(prev => ({ ...prev, kraj: e.target.value }))}
                        placeholder="np. Grecja"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Miasto</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        required 
                        value={tripForm.miasto}
                        onChange={(e) => setTripForm(prev => ({ ...prev, miasto: e.target.value }))}
                        placeholder="np. Ateny"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Opis Wycieczki</label>
                    <textarea 
                      className="input-field" 
                      rows="4" 
                      required
                      style={{ resize: 'vertical' }}
                      value={tripForm.opis}
                      onChange={(e) => setTripForm(prev => ({ ...prev, opis: e.target.value }))}
                      placeholder="Opisz plan wycieczki, atrakcje i udogodnienia..."
                    ></textarea>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">Cena (zł)</label>
                      <input 
                        type="number" 
                        className="input-field" 
                        required 
                        value={tripForm.price}
                        onChange={(e) => setTripForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Maksymalna Liczba Miejsc</label>
                      <input 
                        type="number" 
                        className="input-field" 
                        required 
                        value={tripForm.maxPlaces}
                        onChange={(e) => setTripForm(prev => ({ ...prev, maxPlaces: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">Data Rozpoczęcia</label>
                      <input 
                        type="date" 
                        className="input-field" 
                        required 
                        value={tripForm.startDate}
                        onChange={(e) => setTripForm(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Data Zakończenia</label>
                      <input 
                        type="date" 
                        className="input-field" 
                        required 
                        value={tripForm.endDate}
                        onChange={(e) => setTripForm(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Zdjęcie Główne (Plik)</label>
                    <input 
                      type="file" 
                      id="image-upload" 
                      accept="image/*" 
                      style={{ display: 'none' }}
                      onChange={handleImageChange}
                    />
                    <div className="image-preview-box" onClick={() => document.getElementById('image-upload').click()}>
                      {tripForm.imagePreview ? (
                        <img src={tripForm.imagePreview} alt="Podgląd" />
                      ) : (
                        <span><i className="fa-regular fa-image fa-2x" style={{ display: 'block', marginBottom: '8px' }}></i> Wybierz plik graficzny</span>
                      )}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '14px' }}>
                    <i className="fa-solid fa-floppy-disk"></i> Zapisz Wycieczkę
                  </button>
                </form>
              </div>
            )}

            {/* Sub View: Stats */}
            {adminActiveSubTab === 'stats' && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Panel Analizy Finansowej</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-outline" onClick={fetchAdminStats} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-rotate"></i> Odśwież dane
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowChartsModal(true)}>
                      <i className="fa-solid fa-chart-line"></i> Pokaż Wizualizację Interaktywną
                    </button>
                  </div>
                </div>

                {/* Stats Cards Row */}
                <div className="stats-grid">
                  <div className="glass-panel stat-card">
                    <div className="stat-card-label">Suma Rezerwacji</div>
                    <div className="stat-card-value">
                      {statsPopular.reduce((acc, curr) => acc + curr.bookingsCount, 0)}
                    </div>
                  </div>
                  <div className="glass-panel stat-card">
                    <div className="stat-card-label">Łączny Przychód</div>
                    <div className="stat-card-value" style={{ color: 'var(--secondary)' }}>
                      {statsRevenue.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()} zł
                    </div>
                  </div>
                  <div className="glass-panel stat-card">
                    <div className="stat-card-label">Aktywne Wycieczki</div>
                    <div className="stat-card-value" style={{ color: 'var(--accent)' }}>
                      {trips.length}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '30px' }}>
                  {/* Popular trips table */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '16px' }}><i className="fa-solid fa-fire" style={{color: 'var(--secondary)'}}></i> Najpopularniejsze Wycieczki</h3>
                    <table className="admin-trips-table">
                      <thead>
                        <tr>
                          <th>Wycieczka</th>
                          <th>Rezerwacje</th>
                          <th>Odwiedzający</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statsPopular.map(item => (
                          <tr key={item.tripId}>
                            <td style={{ fontWeight: 600 }}>{item.title}</td>
                            <td>{item.bookingsCount}</td>
                            <td>{item.totalParticipants} osób</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Monthly revenue table */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '16px' }}><i className="fa-solid fa-sack-dollar" style={{color: '#10b981'}}></i> Przychód Miesięczny</h3>
                    <table className="admin-trips-table">
                      <thead>
                        <tr>
                          <th>Miesiąc (2026)</th>
                          <th>Przychód</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statsRevenue.map((item, idx) => {
                          const months = [
                            'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
                            'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
                          ];
                          return (
                            <tr key={idx}>
                              <td style={{ fontWeight: 600 }}>{months[item.month - 1]}</td>
                              <td style={{ color: 'var(--accent)', fontWeight: 600 }}>{item.revenue.toLocaleString()} zł</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Auth Modal (Login / Register) */}
      {authModal.isOpen && (
        <div className="modal-overlay" onClick={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}>
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="auth-tabs">
              <button 
                className={`auth-tab ${authModal.tab === 'login' ? 'active' : ''}`}
                onClick={() => setAuthModal(prev => ({ ...prev, tab: 'login' }))}
              >
                Logowanie
              </button>
              <button 
                className={`auth-tab ${authModal.tab === 'register' ? 'active' : ''}`}
                onClick={() => setAuthModal(prev => ({ ...prev, tab: 'register' }))}
              >
                Rejestracja
              </button>
            </div>

            <div className="auth-form-body">
              <form onSubmit={handleAuthSubmit}>
                {authModal.tab === 'register' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Imię</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        required 
                        value={authForm.imie}
                        onChange={(e) => setAuthForm(prev => ({ ...prev, imie: e.target.value }))}
                        placeholder="np. Jan"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nazwisko</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        required 
                        value={authForm.nazwisko}
                        onChange={(e) => setAuthForm(prev => ({ ...prev, nazwisko: e.target.value }))}
                        placeholder="np. Kowalski"
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Adres Email</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    required 
                    value={authForm.email}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@travel.com"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '30px' }}>
                  <label className="form-label">Hasło</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    required 
                    value={authForm.password}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                  {authModal.tab === 'login' ? 'Zaloguj się' : 'Zarejestruj się'} <i className="fa-solid fa-arrow-right-to-bracket"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Trip Details & Booking Modal */}
      {selectedTrip && (
        <div className="modal-overlay" onClick={() => setSelectedTrip(null)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedTrip(null)}>
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="details-hero">
              {selectedTrip.zdjecieGlowne ? (
                <img src={`data:image/jpeg;base64,${selectedTrip.zdjecieGlowne}`} alt={selectedTrip.tytul} />
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e293b' }}>
                  <i className="fa-solid fa-image fa-4x" style={{color: 'var(--text-muted)'}}></i>
                </div>
              )}
              <div className="details-hero-overlay">
                <h2 className="details-title">{selectedTrip.tytul}</h2>
                <div className="details-location">
                  <i className="fa-solid fa-location-dot" style={{color: 'var(--secondary)'}}></i> {selectedTrip.miasto}, {selectedTrip.kraj}
                </div>
              </div>
            </div>

            <div className="details-body">
              {/* Description and Reviews */}
              <div>
                <h3 className="details-desc-title">Opis Wycieczki</h3>
                <p className="details-desc-text">{selectedTrip.opis}</p>

                <div className="details-meta-grid">
                  <div className="details-meta-item">
                    <div className="details-meta-label">Rozpoczęcie</div>
                    <div className="details-meta-value">{new Date(selectedTrip.dataRozpoczecia).toLocaleDateString('pl-PL')}</div>
                  </div>
                  <div className="details-meta-item">
                    <div className="details-meta-label">Zakończenie</div>
                    <div className="details-meta-value">{new Date(selectedTrip.dataZakonczenia).toLocaleDateString('pl-PL')}</div>
                  </div>
                  <div className="details-meta-item">
                    <div className="details-meta-label">Czas trwania</div>
                    <div className="details-meta-value">
                      {Math.ceil((new Date(selectedTrip.dataZakonczenia) - new Date(selectedTrip.dataRozpoczecia)) / (1000 * 60 * 60 * 24))} dni
                    </div>
                  </div>
                  <div className="details-meta-item">
                    <div className="details-meta-label">Dostępne miejsca</div>
                    <div className="details-meta-value">
                      {selectedTrip.dostepneMiejsca !== undefined ? selectedTrip.dostepneMiejsca : selectedTrip.maksymalnaLiczbaMiejsc} / {selectedTrip.maksymalnaLiczbaMiejsc} miejsc
                    </div>
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="reviews-section">
                  <h3 className="details-desc-title">
                    <i className="fa-regular fa-comment-dots" style={{color: 'var(--primary)'}}></i> Opinie Klientów ({tripReviews.length})
                  </h3>

                  {tripReviews.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', padding: '16px 0' }}>Ta wycieczka nie ma jeszcze żadnych opinii.</p>
                  ) : (
                    <div className="reviews-list">
                      {tripReviews.map(review => (
                        <div key={review.id} className="review-item">
                          <div className="review-header">
                            <span className="review-user">
                              <i className="fa-regular fa-user"></i> {review.uzytkownik ? `${review.uzytkownik.imie} ${review.uzytkownik.nazwisko}` : 'Klient'}
                            </span>
                            <span className="review-date">
                              {new Date(review.dataDodania).toLocaleDateString('pl-PL')}
                            </span>
                          </div>
                          
                          <div className="review-rating">
                            {Array.from({ length: review.ocena }).map((_, idx) => (
                              <i key={idx} className="fa-solid fa-star"></i>
                            ))}
                            {Array.from({ length: 5 - review.ocena }).map((_, idx) => (
                              <i key={idx} className="fa-regular fa-star" style={{color: 'var(--text-muted)'}}></i>
                            ))}
                          </div>

                          <p className="review-text">"{review.komentarz}"</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Review input (only if logged in) */}
                  {user ? (
                    <div className="add-review-form">
                      <h4 style={{ marginBottom: '16px' }}>Dodaj swoją opinię</h4>
                      <form onSubmit={handleReviewSubmit}>
                        <div className="star-rating-input">
                          {Array.from({ length: 5 }).map((_, idx) => {
                            const starVal = idx + 1;
                            return (
                              <i 
                                key={idx} 
                                className={`${reviewForm.rating >= starVal ? 'fa-solid' : 'fa-regular'} fa-star`}
                                onClick={() => setReviewForm(prev => ({ ...prev, rating: starVal }))}
                              ></i>
                            );
                          })}
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                          <textarea 
                            className="input-field" 
                            rows="2" 
                            required
                            placeholder="Napisz swój komentarz..."
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                          ></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary btn-outline">
                          Wyślij Opinię
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="glass-panel" style={{ padding: '16px', marginTop: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <span onClick={() => setAuthModal({ isOpen: true, tab: 'login' })} style={{ color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}>Zaloguj się</span>, aby dodać opinię.
                    </div>
                  )}
                </div>
              </div>

              {/* Side Booking Form */}
              <div>
                <div className="booking-card">
                  <div className="booking-price-tag">
                    <div className="booking-price-value">{selectedTrip.aktualnaCena} zł</div>
                    <div className="booking-price-label">za osobę</div>
                  </div>

                  {user ? (
                    (selectedTrip.dostepneMiejsca !== undefined ? selectedTrip.dostepneMiejsca : selectedTrip.maksymalnaLiczbaMiejsc) <= 0 ? (
                      <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', borderColor: 'var(--danger)', color: 'var(--danger)', marginTop: '16px' }}>
                        <i className="fa-solid fa-triangle-exclamation fa-2x" style={{ marginBottom: '10px' }}></i>
                        <p style={{ fontWeight: 600 }}>Brak wolnych miejsc na tę wycieczkę</p>
                      </div>
                    ) : (
                      <form onSubmit={handleBookingSubmit}>
                        <div className="form-group">
                          <label className="form-label">Liczba uczestników</label>
                          <select 
                            className="input-field"
                            value={bookingForm.participants}
                            onChange={(e) => setBookingForm({ participants: parseInt(e.target.value) })}
                          >
                            {Array.from({ length: Math.min(10, selectedTrip.dostepneMiejsca !== undefined ? selectedTrip.dostepneMiejsca : selectedTrip.maksymalnaLiczbaMiejsc) }).map((_, idx) => (
                              <option key={idx} value={idx + 1}>{idx + 1} {idx === 0 ? 'osoba' : idx < 4 ? 'osoby' : 'osób'}</option>
                            ))}
                          </select>
                        </div>

                        <div className="booking-total-row">
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Do zapłaty:</span>
                          <span className="booking-total-value">
                            {selectedTrip.aktualnaCena * bookingForm.participants} zł
                          </span>
                        </div>

                        <button type="submit" className="btn btn-secondary" style={{ width: '100%', padding: '14px' }}>
                          Rezerwuj Wycieczkę <i className="fa-solid fa-wallet"></i>
                        </button>
                      </form>
                    )
                  ) : (
                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>Zaloguj się, aby dokonać rezerwacji.</p>
                      <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setAuthModal({ isOpen: true, tab: 'login' })}>
                        Zaloguj się teraz <i className="fa-solid fa-right-to-bracket"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal.isOpen && (
        <div className="modal-overlay" onClick={() => setPaymentModal(prev => ({ ...prev, isOpen: false }))}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '30px', textAlign: 'left' }}>
            <button className="modal-close-btn" onClick={() => setPaymentModal(prev => ({ ...prev, isOpen: false }))}>
              <i className="fa-solid fa-xmark"></i>
            </button>

            <h3 style={{ fontSize: '1.4rem', marginBottom: '24px' }}>
              <i className="fa-solid fa-shield-halved" style={{color: 'var(--primary)', marginRight: '8px'}}></i> Dokonaj Płatności
            </h3>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Kwota transakcji</span>
              <strong style={{ fontSize: '1.6rem', color: 'var(--secondary)' }}>{paymentModal.amount} zł</strong>
            </div>

            <form onSubmit={handlePaymentSubmit}>
              <div className="form-group" style={{ marginBottom: '30px' }}>
                <label className="form-label">Wybierz metodę płatności</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px 16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="Karta" 
                      checked={paymentForm.method === 'Karta'} 
                      onChange={() => setPaymentForm({ method: 'Karta' })}
                    />
                    <span><i className="fa-solid fa-credit-card"></i> Karta Płatnicza (Visa/Mastercard)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px 16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="PayPal" 
                      checked={paymentForm.method === 'PayPal'} 
                      onChange={() => setPaymentForm({ method: 'PayPal' })}
                    />
                    <span><i className="fa-brands fa-paypal"></i> PayPal</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px 16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="Przelew" 
                      checked={paymentForm.method === 'Przelew'} 
                      onChange={() => setPaymentForm({ method: 'Przelew' })}
                    />
                    <span><i className="fa-solid fa-money-bill-transfer"></i> Szybki Przelew Bankowy (PayU/Przelewy24)</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-secondary" style={{ width: '100%', padding: '14px' }}>
                Zapłać Teraz <i className="fa-solid fa-lock"></i>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Visualizations / Charts Modal */}
      {showChartsModal && (
        <div className="modal-overlay" onClick={() => setShowChartsModal(false)}>
          <div className="modal-content large animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
            <button className="modal-close-btn" onClick={() => setShowChartsModal(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div style={{ padding: '24px 30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.3rem' }}>
                  <i className="fa-solid fa-chart-pie"></i>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Interaktywne Wykresy Statystyk</h2>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Wizualizacja graficzna wyników finansowych oraz popularności kierunków</p>
                </div>
              </div>

              {/* Tabs Inside Modal */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '25px', gap: '10px' }}>
                <button 
                  className={`tab-btn ${chartsActiveTab === 'revenue' ? 'active' : ''}`}
                  onClick={() => setChartsActiveTab('revenue')}
                  style={{ padding: '12px 20px', fontSize: '0.9rem', background: 'transparent', border: 'none', borderBottom: chartsActiveTab === 'revenue' ? '2px solid var(--primary)' : 'none', color: chartsActiveTab === 'revenue' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
                >
                  <i className="fa-solid fa-sack-dollar"></i> Wykres Przychodów (Miesięczny)
                </button>
                <button 
                  className={`tab-btn ${chartsActiveTab === 'popularity' ? 'active' : ''}`}
                  onClick={() => setChartsActiveTab('popularity')}
                  style={{ padding: '12px 20px', fontSize: '0.9rem', background: 'transparent', border: 'none', borderBottom: chartsActiveTab === 'popularity' ? '2px solid var(--primary)' : 'none', color: chartsActiveTab === 'popularity' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
                >
                  <i className="fa-solid fa-fire"></i> Popularność Kierunków (Donut)
                </button>
              </div>

              {/* Tab Content: Revenue Line Chart */}
              {chartsActiveTab === 'revenue' && (() => {
                const maxRev = Math.max(...statsRevenue.map(r => r.revenue), 1000);
                const monthsAbbrev = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
                const monthsFull = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
                
                // SVG dimensions & grid boundaries
                const svgW = 680;
                const svgH = 300;
                const marginL = 70;
                const marginR = 20;
                const marginT = 30;
                const marginB = 40;
                
                const plotW = svgW - marginL - marginR; // 590
                const plotH = svgH - marginT - marginB; // 230
                
                // Plotting points
                const points = Array.from({ length: 12 }).map((_, i) => {
                  const x = marginL + i * (plotW / 11);
                  const record = statsRevenue.find(r => r.month === i + 1);
                  const val = record ? record.revenue : 0;
                  const y = (svgH - marginB) - (val / maxRev) * plotH;
                  return { x, y, val, month: monthsFull[i], abbrev: monthsAbbrev[i] };
                });
                
                // Line path data
                const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                
                // Area path data (under the line)
                const areaPath = `${linePath} L ${points[11].x} ${svgH - marginB} L ${points[0].x} ${svgH - marginB} Z`;
                
                return (
                  <div style={{ textAlign: 'center' }}>
                    <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ overflow: 'visible' }}>
                      {/* Definitions for gradients */}
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Horizontal Grid Lines */}
                      {Array.from({ length: 5 }).map((_, j) => {
                        const yVal = (svgH - marginB) - (j / 4) * plotH;
                        const labelVal = Math.round((maxRev * (j / 4)));
                        return (
                          <g key={j}>
                            <line 
                              x1={marginL} 
                              y1={yVal} 
                              x2={svgW - marginR} 
                              y2={yVal} 
                              stroke="var(--border-color)" 
                              strokeWidth={1}
                              strokeDasharray={j === 0 ? 'none' : '4 4'}
                            />
                            <text 
                              x={marginL - 10} 
                              y={yVal + 4} 
                              textAnchor="end" 
                              fill="var(--text-muted)" 
                              fontSize="10px"
                            >
                              {labelVal.toLocaleString()} zł
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* Vertical grid lines (for months) */}
                      {points.map((p, i) => (
                        <g key={i}>
                          <line 
                            x1={p.x} 
                            y1={marginT} 
                            x2={p.x} 
                            y2={svgH - marginB} 
                            stroke="var(--border-color)" 
                            strokeWidth={1}
                            strokeDasharray="4 4"
                            opacity={0.3}
                          />
                          <text 
                            x={p.x} 
                            y={svgH - marginB + 20} 
                            textAnchor="middle" 
                            fill="var(--text-secondary)" 
                            fontSize="11px"
                            fontWeight="500"
                          >
                            {p.abbrev}
                          </text>
                        </g>
                      ))}
                      
                      {/* Area Fill */}
                      <path d={areaPath} fill="url(#areaGrad)" />
                      
                      {/* Stroke Line */}
                      <path d={linePath} fill="none" stroke="#10b981" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                      
                      {/* Interactive Circles */}
                      {points.map((p, i) => (
                        <g key={i}>
                          {/* Visible point */}
                          <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r={5} 
                            fill="#10b981" 
                            stroke="var(--panel-bg)" 
                            strokeWidth={2.5} 
                          />
                          {/* Invisible hover area */}
                          <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r={18} 
                            fill="transparent" 
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={(e) => {
                              const rect = e.target.getBoundingClientRect();
                              setHoveredData({
                                type: 'revenue',
                                x: rect.left,
                                y: rect.top - 15,
                                label: p.month,
                                value: p.val
                              });
                            }}
                            onMouseLeave={() => setHoveredData(null)}
                          />
                        </g>
                      ))}
                    </svg>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '15px' }}>
                      <i className="fa-solid fa-circle-info"></i> Najedź kursorem na punkty wykresu, aby zobaczyć dokładne kwoty przychodu.
                    </p>
                  </div>
                );
              })()}

              {/* Tab Content: Popularity Donut Chart */}
              {chartsActiveTab === 'popularity' && (() => {
                const totalParticipants = statsPopular.reduce((acc, curr) => acc + curr.totalParticipants, 0);
                const colors = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
                
                if (totalParticipants === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                      <i className="fa-solid fa-folder-open fa-3x" style={{ marginBottom: '15px', color: 'var(--text-muted)' }}></i>
                      <p>Brak uczestników do wygenerowania wykresu popularności.</p>
                    </div>
                  );
                }
                
                let currentAngle = -Math.PI / 2; // start from top
                const cx = 150;
                const cy = 150;
                const r = 95;
                const ir = 55;
                
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <svg width="300" height="300" viewBox="0 0 300 300" style={{ overflow: 'visible' }}>
                        {statsPopular.map((item, idx) => {
                          const percentage = item.totalParticipants / totalParticipants;
                          const angleSize = percentage * 2 * Math.PI;
                          
                          // Handle 100% case edge case in SVG arcs
                          const adjustedAngleSize = angleSize >= 2 * Math.PI ? 2 * Math.PI - 0.001 : angleSize;
                          
                          const startAngle = currentAngle;
                          const endAngle = currentAngle + adjustedAngleSize;
                          currentAngle = endAngle;
                          
                          const x1 = cx + r * Math.cos(startAngle);
                          const y1 = cy + r * Math.sin(startAngle);
                          const x2 = cx + r * Math.cos(endAngle);
                          const y2 = cy + r * Math.sin(endAngle);
                          
                          const xi1 = cx + ir * Math.cos(startAngle);
                          const yi1 = cy + ir * Math.sin(startAngle);
                          const xi2 = cx + ir * Math.cos(endAngle);
                          const yi2 = cy + ir * Math.sin(endAngle);
                          
                          const largeArc = adjustedAngleSize > Math.PI ? 1 : 0;
                          
                          const pathData = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${ir} ${ir} 0 ${largeArc} 0 ${xi1} ${yi1} Z`;
                          const color = colors[idx % colors.length];
                          
                          return (
                            <g key={item.tripId}>
                              <path 
                                d={pathData} 
                                fill={color} 
                                stroke="var(--panel-bg)" 
                                strokeWidth={2}
                                style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                                opacity={hoveredData && hoveredData.label !== item.title ? 0.6 : 1}
                                onMouseEnter={(e) => {
                                  const rect = e.target.getBoundingClientRect();
                                  setHoveredData({
                                    type: 'popularity',
                                    x: rect.left + rect.width / 2,
                                    y: rect.top - 10,
                                    label: item.title,
                                    bookings: item.bookingsCount,
                                    participants: item.totalParticipants
                                  });
                                }}
                                onMouseLeave={() => setHoveredData(null)}
                              />
                            </g>
                          );
                        })}
                        {/* Middle text */}
                        <circle cx={cx} cy={cy} r={ir - 1} fill="var(--panel-bg)" />
                        <text x={cx} y={cy - 5} textAnchor="middle" fill="var(--text-secondary)" fontSize="11px" fontWeight="500">Suma uczestników</text>
                        <text x={cx} y={cy + 15} textAnchor="middle" fill="var(--text-primary)" fontSize="20px" fontWeight="700">{totalParticipants}</text>
                      </svg>
                    </div>
                    
                    {/* Legend */}
                    <div>
                      <h4 style={{ marginBottom: '16px', fontSize: '1rem' }}>Kierunki i Udział w Sprzedaży</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {statsPopular.map((item, idx) => {
                          const percentage = Math.round((item.totalParticipants / totalParticipants) * 100);
                          const color = colors[idx % colors.length];
                          return (
                            <div 
                              key={item.tripId} 
                              style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', padding: '6px 10px', borderRadius: '6px', background: hoveredData && hoveredData.label === item.title ? 'rgba(255,255,255,0.05)' : 'transparent', transition: 'background 0.2s' }}
                            >
                              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: color, flexShrink: 0 }}></div>
                              <div style={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>{item.title}</div>
                              <div style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>{percentage}% ({item.totalParticipants} os.)</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Floating Tooltip for SVG Charts */}
      {hoveredData && hoveredData.type && (
        <div 
          className="glass-panel" 
          style={{
            position: 'fixed',
            left: hoveredData.x,
            top: hoveredData.y,
            padding: '10px 14px',
            pointerEvents: 'none',
            zIndex: 99999,
            fontSize: '0.85rem',
            borderColor: 'var(--primary)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            background: 'rgba(15, 23, 42, 0.95)',
            transform: 'translate(-50%, -100%)',
            transition: 'left 0.1s ease, top 0.1s ease',
            color: 'var(--text-primary)'
          }}
        >
          {hoveredData.type === 'revenue' ? (
            <div>
              <div style={{ fontWeight: 600, marginBottom: '2px' }}>{hoveredData.label}</div>
              <div style={{ color: '#10b981', fontWeight: 700, fontSize: '1rem' }}>{hoveredData.value.toLocaleString()} zł</div>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 700, marginBottom: '6px', maxWidth: '220px', lineHeight: '1.2' }}>{hoveredData.label}</div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>Liczba rezerwacji: <strong style={{ color: 'var(--secondary)' }}>{hoveredData.bookings}</strong></div>
              <div style={{ color: 'var(--text-secondary)' }}>Uczestnicy: <strong style={{ color: 'var(--accent)' }}>{hoveredData.participants} osób</strong></div>
            </div>
          )}
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast ${toast.type === 'error' ? 'error' : 'success'}`}>
          {toast.type === 'error' ? (
            <i className="fa-solid fa-circle-exclamation" style={{color: '#ef4444'}}></i>
          ) : (
            <i className="fa-solid fa-circle-check" style={{color: '#10b981'}}></i>
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
