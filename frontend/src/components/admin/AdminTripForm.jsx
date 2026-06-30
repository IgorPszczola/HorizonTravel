import React from 'react';

function AdminTripForm({ tripForm, setTripForm, handleTripFormSubmit, handleImageChange }) {
  return (
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
  );
}

export default AdminTripForm;
