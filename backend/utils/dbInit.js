const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || '12345',
    port: process.env.DB_PORT || 5432,
};

const targetDbName = process.env.DB_NAME || 'bidersal';

const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS ogrenci (
        ogrenci_id SERIAL PRIMARY KEY,
        ad VARCHAR(100) NOT NULL,
        soyad VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        sifre_hash VARCHAR(255) NOT NULL,
        tel_no VARCHAR(20),
        dogum_tarihi DATE,
        cinsiyet VARCHAR(10),
        sinif VARCHAR(50),
        hesap_durumu VARCHAR(20) DEFAULT 'aktif',
        kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ogretmen (
        ogretmen_id SERIAL PRIMARY KEY,
        ad VARCHAR(100) NOT NULL,
        soyad VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        sifre_hash VARCHAR(255) NOT NULL,
        tel_no VARCHAR(20),
        dogum_tarihi DATE,
        cinsiyet VARCHAR(10),
        universite VARCHAR(255),
        bolum VARCHAR(255),
        meslek VARCHAR(255),
        biyografi TEXT,
        belge_url VARCHAR(255),
        puan DECIMAL(3, 2) DEFAULT 0,
        dogrulandi_mi BOOLEAN DEFAULT FALSE,
        hesap_durumu VARCHAR(20) DEFAULT 'aktif',
        kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin (
        admin_id SERIAL PRIMARY KEY,
        ad VARCHAR(100) NOT NULL,
        soyad VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        sifre_hash VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ders (
        ders_id SERIAL PRIMARY KEY,
        ders_adi VARCHAR(255) NOT NULL,
        kategori VARCHAR(100),
        seviye VARCHAR(50),
        aktif_mi BOOLEAN DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS ogretmen_ders (
        ogretmen_ders_id SERIAL PRIMARY KEY,
        ogretmen_id INTEGER REFERENCES ogretmen(ogretmen_id),
        ders_id INTEGER REFERENCES ders(ders_id),
        saatlik_ucret DECIMAL(10, 2) NOT NULL,
        aktif_mi BOOLEAN DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS ogretmen_calisma_saatleri (
        calisma_saati_id SERIAL PRIMARY KEY,
        ogretmen_id INTEGER REFERENCES ogretmen(ogretmen_id) ON DELETE CASCADE,
        gun_no INTEGER NOT NULL,
        baslangic_saati TIME NOT NULL,
        bitis_saati TIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS randevu (
        randevu_id SERIAL PRIMARY KEY,
        ogrenci_id INTEGER REFERENCES ogrenci(ogrenci_id),
        ogretmen_ders_id INTEGER REFERENCES ogretmen_ders(ogretmen_ders_id),
        randevu_tarihi_baslangic TIMESTAMP NOT NULL,
        sure_dakika INTEGER DEFAULT 60,
        durum VARCHAR(50) DEFAULT 'Bekliyor',
        zoom_linki VARCHAR(255)
    );

    CREATE TABLE IF NOT EXISTS odeme (
        odeme_id SERIAL PRIMARY KEY,
        randevu_id INTEGER REFERENCES randevu(randevu_id),
        tutar DECIMAL(10, 2) NOT NULL,
        ogrenci_odeme_durumu VARCHAR(50) DEFAULT 'Bekliyor',
        ogretmen_odeme_durumu VARCHAR(50) DEFAULT 'Bekliyor',
        tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ogrenci_odeme_tarihi TIMESTAMP,
        ogretmen_odeme_tarihi TIMESTAMP,
        is_withdrawed BOOLEAN DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS degerlendirme (
        degerlendirme_id SERIAL PRIMARY KEY,
        ogretmen_id INTEGER REFERENCES ogretmen(ogretmen_id),
        ogrenci_id INTEGER REFERENCES ogrenci(ogrenci_id),
        randevu_id INTEGER REFERENCES randevu(randevu_id),
        puan INTEGER CHECK (puan >= 1 AND puan <= 5),
        yorum TEXT,
        tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

async function initializeDatabase() {
    console.log('Checking database...');
    const client = new Client({
        ...dbConfig,
        database: 'postgres' // Connect to default DB first
    });

    try {
        await client.connect();

        // Check if database exists
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [targetDbName]);

        if (res.rowCount === 0) {
            console.log(`Database ${targetDbName} not found. Creating...`);
            await client.query(`CREATE DATABASE "${targetDbName}"`);
            console.log(`Database ${targetDbName} created.`);
        } else {
            console.log(`Database ${targetDbName} already exists.`);
        }
    } catch (err) {
        console.error('Error checking/creating database:', err);
        process.exit(1);
    } finally {
        await client.end();
    }

    // Connect to the actual database to create tables
    const dbClient = new Client({
        ...dbConfig,
        database: targetDbName
    });

    try {
        await dbClient.connect();
        console.log('Connected to database. Checking tables...');

        await dbClient.query(createTablesQuery);
        console.log('Tables checked/created successfully.');

        // Check/Create Default Admin
        const adminCheck = await dbClient.query('SELECT * FROM admin LIMIT 1');
        if (adminCheck.rowCount === 0) {
            console.log('Creating default admin...');
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash('admin123', salt);
            await dbClient.query(
                'INSERT INTO admin (ad, soyad, email, sifre_hash) VALUES ($1, $2, $3, $4)',
                ['Admin', 'User', 'admin@bidersal.com', hash]
            );
            console.log('Default admin created: admin@bidersal.com / admin123');
        }

    } catch (err) {
        console.error('Error initializing tables:', err);
        process.exit(1);
    } finally {
        await dbClient.end();
    }
}

module.exports = initializeDatabase;
