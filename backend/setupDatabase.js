const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'bidersal_db',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

const createTablesQuery = `
-- Tabloları Temizle (Ters sırayla foreign key hatası almamak için)
DROP TABLE IF EXISTS odeme CASCADE;
DROP TABLE IF EXISTS degerlendirme CASCADE;
DROP TABLE IF EXISTS randevu CASCADE;
DROP TABLE IF EXISTS ogretmen_ders CASCADE;
DROP TABLE IF EXISTS ogretmen_calisma_saatleri CASCADE;
DROP TABLE IF EXISTS ders CASCADE;
DROP TABLE IF EXISTS admin CASCADE;
DROP TABLE IF EXISTS ogretmen CASCADE;
DROP TABLE IF EXISTS ogrenci CASCADE;

-- 1. Öğrenci Tablosu
CREATE TABLE ogrenci (
    ogrenci_id SERIAL PRIMARY KEY,
    ad VARCHAR(50) NOT NULL,
    soyad VARCHAR(50) NOT NULL,
    dogum_tarihi DATE,
    cinsiyet VARCHAR(10),
    tel_no VARCHAR(20) UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    sifre_hash VARCHAR(255) NOT NULL,
    sinif VARCHAR(20),
    kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hesap_durumu VARCHAR(20) DEFAULT 'aktif'
);

-- 2. Öğretmen Tablosu
CREATE TABLE ogretmen (
    ogretmen_id SERIAL PRIMARY KEY,
    ad VARCHAR(50) NOT NULL,
    soyad VARCHAR(50) NOT NULL,
    dogum_tarihi DATE,
    cinsiyet VARCHAR(10),
    tel_no VARCHAR(20) UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    sifre_hash VARCHAR(255) NOT NULL,
    universite VARCHAR(100),
    bolum VARCHAR(100),
    meslek VARCHAR(50),
    dogrulandi_mi BOOLEAN DEFAULT FALSE,
    biyografi TEXT,
    puan DECIMAL(3, 2) DEFAULT 0,
    belge_url TEXT,
    hesap_durumu VARCHAR(20) DEFAULT 'aktif',
    kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Admin Tablosu
CREATE TABLE admin (
    admin_id SERIAL PRIMARY KEY,
    ad VARCHAR(50) NOT NULL,
    soyad VARCHAR(50) NOT NULL,
    dogum_tarihi DATE,
    cinsiyet VARCHAR(10),
    tel_no VARCHAR(20) UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    sifre_hash VARCHAR(255) NOT NULL,
    kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Ders Tablosu
CREATE TABLE ders (
    ders_id SERIAL PRIMARY KEY,
    ders_adi VARCHAR(100) NOT NULL,
    kategori VARCHAR(50) NOT NULL,
    seviye VARCHAR(50),
    aktif_mi BOOLEAN DEFAULT TRUE
);

-- 5. Öğretmen Ders İlişkisi
CREATE TABLE ogretmen_ders (
    ogretmen_ders_id SERIAL PRIMARY KEY,
    ogretmen_id INT REFERENCES ogretmen(ogretmen_id) ON DELETE CASCADE,
    ders_id INT REFERENCES ders(ders_id) ON DELETE CASCADE,
    saatlik_ucret DECIMAL(10, 2) NOT NULL,
    aktif_mi BOOLEAN DEFAULT TRUE,
    UNIQUE(ogretmen_id, ders_id)
);

-- 6. Öğretmen Çalışma Saatleri (EKSİKTİ EKLENDİ)
CREATE TABLE ogretmen_calisma_saatleri (
    calisma_saati_id SERIAL PRIMARY KEY,
    ogretmen_id INT REFERENCES ogretmen(ogretmen_id) ON DELETE CASCADE,
    gun_no INT NOT NULL, -- 1=Pazartesi, 7=Pazar
    baslangic_saati TIME NOT NULL,
    bitis_saati TIME NOT NULL
);

-- 7. Randevu Tablosu
CREATE TABLE randevu (
    randevu_id SERIAL PRIMARY KEY,
    ogrenci_id INT REFERENCES ogrenci(ogrenci_id) ON DELETE SET NULL,
    ogretmen_ders_id INT REFERENCES ogretmen_ders(ogretmen_ders_id) ON DELETE SET NULL,
    randevu_tarihi_baslangic TIMESTAMP NOT NULL,
    sure_dakika INT DEFAULT 60,
    durum VARCHAR(20) DEFAULT 'Onay Bekliyor',
    zoom_linki TEXT,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Ödeme Tablosu
CREATE TABLE odeme (
    odeme_id SERIAL PRIMARY KEY,
    randevu_id INT REFERENCES randevu(randevu_id) ON DELETE CASCADE,
    tutar DECIMAL(10, 2) NOT NULL,
    ogrenci_odeme_durumu VARCHAR(20) DEFAULT 'Bekleniyor',
    ogretmen_odeme_durumu VARCHAR(20) DEFAULT 'Bekleniyor',
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Değerlendirme Tablosu (EKSİKTİ EKLENDİ)
CREATE TABLE degerlendirme (
    degerlendirme_id SERIAL PRIMARY KEY,
    ogretmen_id INT REFERENCES ogretmen(ogretmen_id) ON DELETE CASCADE,
    ogrenci_id INT REFERENCES ogrenci(ogrenci_id) ON DELETE SET NULL,
    puan INT CHECK (puan >= 1 AND puan <= 5),
    yorum TEXT,
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ÖRNEK VERİLER (SEED DATA) --

INSERT INTO ders (ders_adi, kategori, seviye) VALUES 
('Matematik', 'Sayısal', 'Lise'), 
('Fizik', 'Sayısal', 'Lise'), 
('İngilizce', 'Dil', 'Genel'),
('Piyano', 'Müzik', 'Başlangıç');

INSERT INTO ogrenci (ad, soyad, email, sifre_hash, tel_no, sinif) VALUES
('Yunus', 'Öğrenci', 'yunus@student.com', '123456', '5550001', '12. Sınıf'),
('Ayşe', 'Yılmaz', 'ayse@student.com', '123456', '5550002', 'Mezun');

INSERT INTO ogretmen (ad, soyad, email, sifre_hash, tel_no, universite, bolum, meslek, dogrulandi_mi, biyografi, puan) VALUES
('Ahmet', 'Hoca', 'ahmet@teacher.com', '123456', '5551001', 'ODTÜ', 'Matematik', 'Öğretmen', TRUE, 'Matematik benim işim. 10 yıllık tecrübe.', 4.8),
('Zeynep', 'Kaya', 'zeynep@teacher.com', '123456', '5551002', 'Boğaziçi', 'Fizik', 'Akademisyen', TRUE, 'Fiziği sevdiren öğretmen.', 5.0);

INSERT INTO admin (ad, soyad, email, sifre_hash) VALUES
('Admin', 'User', 'admin@bidersal.com', '123456');

INSERT INTO ogretmen_ders (ogretmen_id, ders_id, saatlik_ucret) VALUES 
(1, 1, 500.00), -- Ahmet Hoca Matematik
(2, 2, 600.00); -- Zeynep Hoca Fizik

-- Çalışma Saatleri Örneği
INSERT INTO ogretmen_calisma_saatleri (ogretmen_id, gun_no, baslangic_saati, bitis_saati) VALUES
(1, 1, '09:00', '17:00'), -- Pazartesi
(1, 2, '10:00', '16:00'); -- Salı

-- Randevu Örneği
INSERT INTO randevu (ogrenci_id, ogretmen_ders_id, randevu_tarihi_baslangic, durum) VALUES
(1, 1, NOW() + INTERVAL '2 days', 'Planlandı'),
(1, 1, NOW() - INTERVAL '2 days', 'Tamamlandı'); -- Geçmiş ders (Puanlanabilir)

-- Ödeme Örneği
INSERT INTO odeme (randevu_id, tutar, ogrenci_odeme_durumu) VALUES
(2, 500.00, 'Ödendi');
`;

const setupDatabase = async () => {
  try {
    console.log('Veritabanı kuruluyor...');
    await pool.query(createTablesQuery);
    console.log('✅ Veritabanı başarıyla kuruldu.');
  } catch (err) {
    console.error('❌ Hata:', err);
  } finally {
    await pool.end();
  }
};

setupDatabase();