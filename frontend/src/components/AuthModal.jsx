import React from 'react';

function AuthModal({ authModal, setAuthModal, authForm, setAuthForm, handleAuthSubmit, handleCancelAuth }) {
  if (!authModal.isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancelAuth}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleCancelAuth}>
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
  );
}

export default AuthModal;
