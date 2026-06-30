import React from 'react';

function AdminTripList({ trips, startEditTrip, handleTripDelete }) {
  return (
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
  );
}

export default AdminTripList;
