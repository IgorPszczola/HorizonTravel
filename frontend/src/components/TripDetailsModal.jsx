import React from 'react';
import { getTripImage } from '../utils/api';

function TripDetailsModal({
  selectedTrip,
  setSelectedTrip,
  bookingStatus,
  setBookingStatus,
  hideBookingForm,
  tripReviews,
  user,
  reviewForm,
  setReviewForm,
  handleReviewSubmit,
  bookingForm,
  setBookingForm,
  handleBookingSubmit,
  setTripToReopen,
  setAuthModal
}) {
  if (!selectedTrip) return null;

  const handleClose = () => {
    setSelectedTrip(null);
    setBookingStatus(null);
  };

  const durationDays = Math.ceil(
    (new Date(selectedTrip.dataZakonczenia) - new Date(selectedTrip.dataRozpoczecia)) / (1000 * 60 * 60 * 24)
  );

  const availablePlaces = selectedTrip.dostepneMiejsca !== undefined 
    ? selectedTrip.dostepneMiejsca 
    : selectedTrip.maksymalnaLiczbaMiejsc;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="details-hero">
          <img 
            src={getTripImage(selectedTrip)} 
            alt={selectedTrip.tytul} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';
            }}
          />
          <div className="details-hero-overlay">
            <h2 className="details-title">{selectedTrip.tytul}</h2>
            <div className="details-location">
              <i className="fa-solid fa-location-dot" style={{color: 'var(--secondary)'}}></i> {selectedTrip.miasto}, {selectedTrip.kraj}
            </div>
          </div>
        </div>

        <div className="details-body" style={{ gridTemplateColumns: hideBookingForm ? '1fr' : '1.8fr 1.2fr' }}>
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
                <div className="details-meta-value">{durationDays} dni</div>
              </div>
              {bookingStatus ? (
                <div className="details-meta-item">
                  <div className="details-meta-label">Status rezerwacji</div>
                  <div className="details-meta-value">
                    <span className={`booking-status-badge ${bookingStatus === 'Opłacona' ? 'paid' : 'pending'}`} style={{ display: 'inline-block', padding: '2px 8px', fontSize: '0.85rem' }}>
                      {bookingStatus}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="details-meta-item">
                  <div className="details-meta-label">Dostępne miejsca</div>
                  <div className="details-meta-value">
                    {availablePlaces} / {selectedTrip.maksymalnaLiczbaMiejsc} miejsc
                  </div>
                </div>
              )}
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
                  <span onClick={() => {
                    setTripToReopen(selectedTrip);
                    setSelectedTrip(null);
                    setAuthModal({ isOpen: true, tab: 'login' });
                  }} style={{ color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}>Zaloguj się</span>, aby dodać opinię.
                </div>
              )}
            </div>
          </div>

          {/* Side Booking Form */}
          {!hideBookingForm && (
            <div>
              <div className="booking-card">
                <div className="booking-price-tag">
                  <div className="booking-price-value">{selectedTrip.aktualnaCena} zł</div>
                  <div className="booking-price-label">za osobę</div>
                </div>

                {user ? (
                  availablePlaces <= 0 ? (
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
                          {Array.from({ length: Math.min(10, availablePlaces) }).map((_, idx) => (
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
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => {
                      setTripToReopen(selectedTrip);
                      setSelectedTrip(null);
                      setAuthModal({ isOpen: true, tab: 'login' });
                    }}>
                      Zaloguj się teraz <i className="fa-solid fa-right-to-bracket"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TripDetailsModal;
