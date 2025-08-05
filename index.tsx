import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
  const [email, setEmail] = useState('');
  const [ideas, setIdeas] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !ideas.trim()) {
      setErrorMessage('Lütfen tüm alanları doldurun.');
      return;
    }

    setStatus('sending');

    try {
      const response = await fetch('https://anket-0508.onrender.com/api/send-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ideas }),
      });

      if (response.ok) {
        setStatus('success');
      } else {
        const errorData = await response.text();
        throw new Error(errorData || 'Sunucu hatası oluştu.');
      }
    } catch (e: any) {
      console.error('Form submission error:', e);
      setErrorMessage('Fikirlerinizi gönderirken bir sorunla karşılaştık. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.');
      setStatus('error');
    }
  };

  const handleReset = () => {
    setEmail('');
    setIdeas('');
    setStatus('idle');
    setErrorMessage(null);
  };
  
  const Logo = () => (
    <img src="https://cdn.shopify.com/s/files/1/0686/5128/6717/files/dekorla-logo.png" alt="Dekorla Logo" className="logo" />
  );

  const isLoading = status === 'sending';
  const isFormDisabled = isLoading || status === 'success';

  if (status === 'success') {
    return (
        <div className="app-container">
            <header>
                <Logo />
                <h1>Teşekkür Ederiz!</h1>
                <p>Değerli fikirleriniz ve içgörüleriniz başarıyla tarafımıza iletilmiştir.</p>
                <button type="button" className="submit-btn" onClick={handleReset}>
                  Yeni Fikir Paylaş
                </button>
            </header>
        </div>
    );
  }

  return (
    <div className="app-container">
      <header>
        <Logo />
        <h1>Fikirlerinizi Paylaşın</h1>
        <p>Dekorla'yı daha iyi hale getirmemize yardımcı olacak fikirlerinizi ve önerilerinizi duymaktan mutluluk duyarız.</p>
      </header>
      <form className="survey-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">E-posta Adresiniz</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@mail.com"
            required
            aria-required="true"
            disabled={isFormDisabled}
          />
        </div>
        <div className="form-group">
          <label htmlFor="ideas">Fikirleriniz</label>
          <textarea
            id="ideas"
            value={ideas}
            onChange={(e) => setIdeas(e.target.value)}
            placeholder="Buraya yazın..."
            required
            aria-required="true"
            disabled={isFormDisabled}
          />
        </div>

        {errorMessage && (
          <div className="error-container">
            <p className="error-message">{errorMessage}</p>
          </div>
        )}

        {isLoading ? (
             <div className="spinner-container">
                <div className="spinner"></div>
                <p>Gönderiliyor...</p>
            </div>
        ) : (
            <button type="submit" className="submit-btn" disabled={isLoading}>
              Fikrimi Gönder
            </button>
        )}
      </form>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
