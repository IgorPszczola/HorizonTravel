import React from 'react';
import AdminTripList from './AdminTripList';
import AdminTripForm from './AdminTripForm';
import AdminStats from './AdminStats';

function AdminPanel({
  adminActiveSubTab,
  setAdminActiveSubTab,
  trips,
  startEditTrip,
  handleTripDelete,
  tripForm,
  setTripForm,
  handleTripFormSubmit,
  handleImageChange,
  statsRevenue,
  statsPopular,
  fetchAdminStats,
  setShowChartsModal
}) {
  return (
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
        <AdminTripList 
          trips={trips} 
          startEditTrip={startEditTrip} 
          handleTripDelete={handleTripDelete} 
        />
      )}

      {/* Sub View: Add/Edit Trip */}
      {adminActiveSubTab === 'add' && (
        <AdminTripForm 
          tripForm={tripForm} 
          setTripForm={setTripForm} 
          handleTripFormSubmit={handleTripFormSubmit} 
          handleImageChange={handleImageChange} 
        />
      )}

      {/* Sub View: Stats */}
      {adminActiveSubTab === 'stats' && (
        <AdminStats 
          statsRevenue={statsRevenue} 
          statsPopular={statsPopular} 
          trips={trips} 
          fetchAdminStats={fetchAdminStats} 
          setShowChartsModal={setShowChartsModal} 
        />
      )}
    </div>
  );
}

export default AdminPanel;
