import React from 'react';

function AdminStats({ statsRevenue, statsPopular, trips, fetchAdminStats, setShowChartsModal }) {
  const totalBookings = statsPopular.reduce((acc, curr) => acc + curr.bookingsCount, 0);
  const totalRevenue = statsRevenue.reduce((acc, curr) => acc + curr.revenue, 0);

  return (
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
          <div className="stat-card-value">{totalBookings}</div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-card-label">Łączny Przychód</div>
          <div className="stat-card-value" style={{ color: 'var(--secondary)' }}>
            {totalRevenue.toLocaleString()} zł
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
  );
}

export default AdminStats;
