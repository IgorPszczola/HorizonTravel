import React from 'react';

function PaymentModal({ paymentModal, setPaymentModal, paymentForm, setPaymentForm, handlePaymentSubmit }) {
  if (!paymentModal.isOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setPaymentModal(prev => ({ ...prev, isOpen: false }))}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '30px', textAlign: 'left' }}>
        <button className="modal-close-btn" onClick={() => setPaymentModal(prev => ({ ...prev, isOpen: false }))}>
          <i className="fa-solid fa-xmark"></i>
        </button>

        <h3 style={{ fontSize: '1.4rem', marginBottom: '24px' }}>
          <i className="fa-solid fa-shield-halved" style={{color: 'var(--primary)', marginRight: '8px'}}></i> Dokonaj Płatności
        </h3>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Kwota transakcji</span>
          <strong style={{ fontSize: '1.6rem', color: 'var(--secondary)' }}>{paymentModal.amount} zł</strong>
        </div>

        <form onSubmit={handlePaymentSubmit}>
          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label className="form-label">Wybierz metodę płatności</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px 16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="Karta" 
                  checked={paymentForm.method === 'Karta'} 
                  onChange={() => setPaymentForm({ method: 'Karta' })}
                />
                <span><i className="fa-solid fa-credit-card"></i> Karta Płatnicza (Visa/Mastercard)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px 16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="PayPal" 
                  checked={paymentForm.method === 'PayPal'} 
                  onChange={() => setPaymentForm({ method: 'PayPal' })}
                />
                <span><i className="fa-brands fa-paypal"></i> PayPal</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px 16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="Przelew" 
                  checked={paymentForm.method === 'Przelew'} 
                  onChange={() => setPaymentForm({ method: 'Przelew' })}
                />
                <span><i className="fa-solid fa-money-bill-transfer"></i> Szybki Przelew Bankowy (PayU/Przelewy24)</span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-secondary" style={{ width: '100%', padding: '14px' }}>
            Zapłać Teraz <i className="fa-solid fa-lock"></i>
          </button>
        </form>
      </div>
    </div>
  );
}

export default PaymentModal;
