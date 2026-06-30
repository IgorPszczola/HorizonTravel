import React from 'react';
import { getTripImage } from '../utils/api';

function TripCard({ trip, onOpenDetails }) {
  const durationDays = Math.ceil(
    (new Date(trip.dataZakonczenia) - new Date(trip.dataRozpoczecia)) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="glass-panel trip-card">
      <div className="trip-image-container">
        <img 
          src={getTripImage(trip)} 
          alt={trip.tytul}
          className="trip-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';
          }}
        />
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
            <i className="fa-solid fa-clock"></i> {durationDays} dni
          </span>
        </div>

        <button 
          className="btn btn-primary" 
          style={{ marginTop: '20px', width: '100%' }}
          onClick={() => onOpenDetails(trip)}
        >
          Zobacz szczegóły <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
}

export default TripCard;
