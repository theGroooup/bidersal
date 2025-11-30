const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        let table = role === 'STUDENT' ? 'ogrenci' : role === 'TEACHER' ? 'ogretmen' : 'admin';
        let idField = role === 'STUDENT' ? 'ogrenci_id' : role === 'TEACHER' ? 'ogretmen_id' : 'admin_id';

        const result = await db.query(`SELECT * FROM ${table} WHERE email = $1`, [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Hatalı e-posta veya şifre' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.sifre_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Hatalı e-posta veya şifre' });
        }

        res.json({
            id: user[idField],
            name: user.ad,
            surname: user.soyad,
            email: user.email,
            role: role,
            accountStatus: user.hesap_durumu || 'aktif',
            joinDate: user.kayit_tarihi
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.register = async (req, res) => {
    const { role, name, surname, email, password, phone, birthDate, gender } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let query = '';
        if (role === 'STUDENT') {
            query = 'INSERT INTO ogrenci (ad, soyad, email, sifre_hash, tel_no, dogum_tarihi, cinsiyet) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ogrenci_id as id';
        } else {
            query = 'INSERT INTO ogretmen (ad, soyad, email, sifre_hash, tel_no, dogum_tarihi, cinsiyet) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ogretmen_id as id';
        }

        const result = await db.query(query, [name, surname, email, hashedPassword, phone, birthDate, gender]);
        res.status(201).json({ userId: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: 'Kayıt oluşturulamadı. E-posta kullanımda olabilir.' });
    }
};
