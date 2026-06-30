import React from 'react';

function MyBookings({
  loadingBookings,
  myBookings,
  setBookingStatus,
  handleOpenTripDetailsById,
  setPaymentModal
}) {
  return (
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
                
                <button 
                  className="btn btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px' }}
                  onClick={() => {
                    setBookingStatus(booking.status);
                    handleOpenTripDetailsById(booking.wycieczka?.id, true);
                  }}
                >
                  <i className="fa-solid fa-circle-info"></i> Szczegóły
                </button>

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
  );
}

export default MyBookings;
