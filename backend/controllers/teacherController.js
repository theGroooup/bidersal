const db = require('../config/db');

exports.getProfile = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM ogretmen WHERE ogretmen_id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Öğretmen bulunamadı' });

        const user = result.rows[0];
        res.json({
            id: user.ogretmen_id,
            name: user.ad,
            surname: user.soyad,
            email: user.email,
            phone: user.tel_no,
            university: user.universite,
            department: user.bolum,
            profession: user.meslek,
            bio: user.biyografi,
            birthDate: user.dogum_tarihi,
            gender: user.cinsiyet,
            documentUrl: user.belge_url
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    const { name, surname, phone, university, department, profession, bio, birthDate, gender } = req.body;
    try {
        await db.query(
            'UPDATE ogretmen SET ad=$1, soyad=$2, tel_no=$3, universite=$4, bolum=$5, meslek=$6, biyografi=$7, dogum_tarihi=$8, cinsiyet=$9 WHERE ogretmen_id=$10',
            [name, surname, phone, university, department, profession, bio, birthDate, gender, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAvailability = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM ogretmen_calisma_saatleri WHERE ogretmen_id = $1', [req.params.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateAvailability = async (req, res) => {
    const { teacherId, day, start, end } = req.body;
    try {
        const check = await db.query('SELECT * FROM ogretmen_calisma_saatleri WHERE ogretmen_id = $1 AND gun_no = $2', [teacherId, day]);
        if (check.rows.length > 0) {
            await db.query('UPDATE ogretmen_calisma_saatleri SET baslangic_saati=$1, bitis_saati=$2 WHERE ogretmen_id=$3 AND gun_no=$4', [start, end, teacherId, day]);
        } else {
            await db.query('INSERT INTO ogretmen_calisma_saatleri (ogretmen_id, gun_no, baslangic_saati, bitis_saati) VALUES ($1, $2, $3, $4)', [teacherId, day, start, end]);
        }
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteAvailability = async (req, res) => {
    try {
        await db.query('DELETE FROM ogretmen_calisma_saatleri WHERE calisma_saati_id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getBusySlots = async (req, res) => {
    try {
        const query = `
            SELECT randevu_tarihi_baslangic as date, sure_dakika as duration
            FROM randevu r
            JOIN ogretmen_ders od ON r.ogretmen_ders_id = od.ogretmen_ders_id
            WHERE od.ogretmen_id = $1 AND r.durum NOT IN ('Öğrenci İptal', 'Öğretmen İptal')
        `;
        const result = await db.query(query, [req.params.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getLessons = async (req, res) => {
    try {
        const query = `
            SELECT od.ogretmen_ders_id as id, d.ders_adi as "subjectName", d.kategori as category, od.saatlik_ucret as "hourlyRate"
            FROM ogretmen_ders od JOIN ders d ON od.ders_id = d.ders_id
            WHERE od.ogretmen_id = $1 AND od.aktif_mi = TRUE
        `;
        const result = await db.query(query, [req.params.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addLesson = async (req, res) => {
    const { teacherId, subjectId, hourlyRate } = req.body; // Note: server.js used hourlyRate, frontend likely sends hourlyRate
    try {
        const check = await db.query('SELECT * FROM ogretmen_ders WHERE ogretmen_id = $1 AND ders_id = $2', [teacherId, subjectId]);
        if (check.rows.length > 0) {
            await db.query('UPDATE ogretmen_ders SET saatlik_ucret = $1, aktif_mi = TRUE WHERE ogretmen_ders_id = $2', [hourlyRate, check.rows[0].ogretmen_ders_id]);
        } else {
            await db.query('INSERT INTO ogretmen_ders (ogretmen_id, ders_id, saatlik_ucret) VALUES ($1, $2, $3)', [teacherId, subjectId, hourlyRate]);
        }
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteLesson = async (req, res) => {
    try {
        await db.query('UPDATE ogretmen_ders SET aktif_mi = FALSE WHERE ogretmen_ders_id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllLessons = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM ders');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
