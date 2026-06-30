import React from 'react';

function Navbar({ activeTab, setActiveTab, user, handleLogout, setAuthModal, setAdminActiveSubTab }) {
  return (
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
  );
}

export default Navbar;
