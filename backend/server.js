// Gerekli kütüphaneleri içeri aktar
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors'); // CORS kütüphanesini etkinleştir
require('dotenv').config(); // .env dosyasındaki değişkenleri yükler

// Express uygulamasını başlat
const app = express();

// --- CORS Middleware ---
// Üretim ortamında güvenliği sağlamak için, yalnızca Shopify mağazanızdan
// gelen isteklere izin verilir. Bu, yetkisiz erişimi engeller.
app.use(cors({
  origin: 'https://dekorla.co'
}));


// Gelen isteklerin JSON formatında olmasını sağla
app.use(express.json());

// Frontend'den gelen isteği karşılayacak API endpoint'i
app.post('/api/send-feedback', async (req, res) => {
  // İstek gövdesinden email ve ideas bilgilerini al
  const { email, ideas } = req.body;

  if (!email || !ideas) {
    return res.status(400).send('E-posta ve fikir alanları zorunludur.');
  }

  // --- SMTP Configuration ---
  // Dekorla.co mail sunucusu için doğru SMTP bilgileri girildi.
  const smtpConfig = {
    host: 'mail.dekorla.co',
    port: 587,
    secure: false, // port 587 için STARTTLS kullanılır
    auth: {
      user: 'info@dekorla.co',
      pass: 'Bella197265!',
    },
    // Gerekli olmadıkça TLS doğrulamasını atlamamak en güvenlisidir.
    // tls: {
    //   rejectUnauthorized: false
    // },
    // Bağlantının askıda kalmasını önlemek için zaman aşımları
    connectionTimeout: 10000, // 10 saniye
    socketTimeout: 10000,     // 10 saniye
  };

  let transporter = nodemailer.createTransport(smtpConfig);

  // Gönderilecek e-postanın seçeneklerini ayarla
  let mailOptions = {
    from: `"Dekorla Fikir Anketi" <${smtpConfig.auth.user}>`, // Gönderen adresi
    to: 'info@dekorla.co', // Alıcı (Şirket)
    cc: email, // Kullanıcıya da kopyasını gönder
    subject: `Yeni Fikir Anketi Geri Bildirimi`, // E-posta konusu
    html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2 style="color: #1f2937;">Yeni bir geri bildirim aldınız!</h2>
        <p><strong>Kullanıcı E-posta:</strong> ${email}</p>
        <h3 style="color: #1f2937;">Kullanıcının Fikri:</h3>
        <p style="white-space: pre-wrap; background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px;">${ideas}</p>
      </div>
    `,
  };

  // E-postayı gönder
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('E-posta başarıyla gönderildi.');
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    res.status(500).send('E-posta gönderilirken bir hata oluştu.');
  }
});

// Sunucuyu dinlemeye başla
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});
