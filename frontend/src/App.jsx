import { useState, useEffect } from 'react';
import './App.css';
import { API_BASE_URL } from './utils/api';

// Subcomponents
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import TripCard from './components/TripCard';
import TripDetailsModal from './components/TripDetailsModal';
import PaymentModal from './components/PaymentModal';
import MyBookings from './components/MyBookings';
import AdminPanel from './components/admin/AdminPanel';
import StatsChartsModal from './components/admin/StatsChartsModal';

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
  const [hideBookingForm, setHideBookingForm] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, bookingId: null, amount: 0 });
  const [tripToReopen, setTripToReopen] = useState(null);

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

  const handleCancelAuth = () => {
    setAuthModal(prev => ({ ...prev, isOpen: false }));
    if (tripToReopen) {
      setSelectedTrip(tripToReopen);
      setTripToReopen(null);
      setHideBookingForm(false);
    }
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
          if (tripToReopen) {
            setSelectedTrip(tripToReopen);
            setTripToReopen(null);
            setHideBookingForm(false);
          }
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
        fetchTrips(); // Update available seats in real-time
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
        fetchTrips(); // Update available seats in real-time
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
  const handleOpenTripDetails = (trip, disableBooking = false) => {
    setSelectedTrip(trip);
    setHideBookingForm(disableBooking);
    if (!disableBooking) {
      setBookingStatus(null);
    }
    fetchTripReviews(trip.id);
    setBookingForm({ participants: 1 });
    setReviewForm({ rating: 5, comment: '' });
  };

  const handleOpenTripDetailsById = async (tripId, disableBooking = false) => {
    if (!tripId) return;
    const localTrip = trips.find(t => t.id === tripId);
    if (localTrip) {
      handleOpenTripDetails(localTrip, disableBooking);
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/trips/${tripId}`);
      if (res.ok) {
        const data = await res.json();
        handleOpenTripDetails(data, disableBooking);
      } else {
        showToast('Nie udało się pobrać szczegółów wycieczki', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Błąd połączenia z serwerem', 'error');
    }
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
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        handleLogout={handleLogout} 
        setAuthModal={setAuthModal}
        setAdminActiveSubTab={setAdminActiveSubTab}
      />

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
                  <TripCard 
                    key={trip.id} 
                    trip={trip} 
                    onOpenDetails={handleOpenTripDetails} 
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Bookings View */}
        {activeTab === 'bookings' && user && (
          <MyBookings 
            loadingBookings={loadingBookings}
            myBookings={myBookings}
            setBookingStatus={setBookingStatus}
            handleOpenTripDetailsById={handleOpenTripDetailsById}
            setPaymentModal={setPaymentModal}
          />
        )}

        {/* Admin Dashboard */}
        {activeTab === 'admin' && user && user.rola === 'Admin' && (
          <AdminPanel 
            adminActiveSubTab={adminActiveSubTab}
            setAdminActiveSubTab={setAdminActiveSubTab}
            trips={trips}
            startEditTrip={startEditTrip}
            handleTripDelete={handleTripDelete}
            tripForm={tripForm}
            setTripForm={setTripForm}
            handleTripFormSubmit={handleTripFormSubmit}
            handleImageChange={handleImageChange}
            statsRevenue={statsRevenue}
            statsPopular={statsPopular}
            fetchAdminStats={fetchAdminStats}
            setShowChartsModal={setShowChartsModal}
          />
        )}
      </main>

      {/* Auth Modal (Login / Register) */}
      <AuthModal 
        authModal={authModal}
        setAuthModal={setAuthModal}
        authForm={authForm}
        setAuthForm={setAuthForm}
        handleAuthSubmit={handleAuthSubmit}
        handleCancelAuth={handleCancelAuth}
      />

      {/* Trip Details & Booking Modal */}
      <TripDetailsModal 
        selectedTrip={selectedTrip}
        setSelectedTrip={setSelectedTrip}
        bookingStatus={bookingStatus}
        setBookingStatus={setBookingStatus}
        hideBookingForm={hideBookingForm}
        tripReviews={tripReviews}
        user={user}
        reviewForm={reviewForm}
        setReviewForm={setReviewForm}
        handleReviewSubmit={handleReviewSubmit}
        bookingForm={bookingForm}
        setBookingForm={setBookingForm}
        handleBookingSubmit={handleBookingSubmit}
        setTripToReopen={setTripToReopen}
        setAuthModal={setAuthModal}
      />

      {/* Payment Modal */}
      <PaymentModal 
        paymentModal={paymentModal}
        setPaymentModal={setPaymentModal}
        paymentForm={paymentForm}
        setPaymentForm={setPaymentForm}
        handlePaymentSubmit={handlePaymentSubmit}
      />

      {/* Visualizations / Charts Modal */}
      <StatsChartsModal 
        showChartsModal={showChartsModal}
        setShowChartsModal={setShowChartsModal}
        chartsActiveTab={chartsActiveTab}
        setChartsActiveTab={setChartsActiveTab}
        statsRevenue={statsRevenue}
        statsPopular={statsPopular}
        hoveredData={hoveredData}
        setHoveredData={setHoveredData}
      />

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
