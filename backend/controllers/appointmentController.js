const db = require('../config/db');

exports.getStudentAppointments = async (req, res) => {
    // Ensure column exists (Migration logic)
    try {
        await db.query('ALTER TABLE degerlendirme ADD COLUMN IF NOT EXISTS randevu_id INTEGER');
    } catch (e) { console.log('Schema check:', e.message); }

    const query = `
        SELECT r.randevu_id as id, r.randevu_tarihi_baslangic as date, r.sure_dakika as "durationMinutes",
        r.durum as status, r.zoom_linki as "zoomLink",
        CONCAT(o.ad, ' ', o.soyad) as "teacherName", d.ders_adi as "subjectName", od.saatlik_ucret as price,
        o.ogretmen_id as "teacherId",
        CASE WHEN deg.degerlendirme_id IS NOT NULL THEN TRUE ELSE FALSE END as "isReviewed"
        FROM randevu r
        JOIN ogretmen_ders od ON r.ogretmen_ders_id = od.ogretmen_ders_id
        JOIN ogretmen o ON od.ogretmen_id = o.ogretmen_id
        JOIN ders d ON od.ders_id = d.ders_id
        LEFT JOIN degerlendirme deg ON r.randevu_id = deg.randevu_id
        WHERE r.ogrenci_id = $1 ORDER BY r.randevu_tarihi_baslangic DESC
    `;
    try {
        const result = await db.query(query, [req.params.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTeacherAppointments = async (req, res) => {
    const query = `
        SELECT r.randevu_id as id, r.randevu_tarihi_baslangic as date, r.sure_dakika as "durationMinutes",
        r.durum as status, r.zoom_linki as "zoomLink",
        CONCAT(o.ad, ' ', o.soyad) as "studentName", d.ders_adi as "subjectName"
        FROM randevu r
        JOIN ogretmen_ders od ON r.ogretmen_ders_id = od.ogretmen_ders_id
        JOIN ogrenci o ON r.ogrenci_id = o.ogrenci_id
        JOIN ders d ON od.ders_id = d.ders_id
        WHERE od.ogretmen_id = $1 ORDER BY r.randevu_tarihi_baslangic DESC
    `;
    try {
        const result = await db.query(query, [req.params.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createAppointment = async (req, res) => {
    const { studentId, offeringId, date } = req.body;
    try {
        const priceRes = await db.query('SELECT saatlik_ucret, aktif_mi FROM ogretmen_ders WHERE ogretmen_ders_id = $1', [offeringId]);
        if (priceRes.rows.length === 0 || !priceRes.rows[0].aktif_mi) {
            return res.status(400).json({ error: 'Bu ders artık aktif değil.' });
        }
        const price = priceRes.rows[0].saatlik_ucret;

        const randevuRes = await db.query(
            'INSERT INTO randevu (ogrenci_id, ogretmen_ders_id, randevu_tarihi_baslangic) VALUES ($1, $2, $3) RETURNING randevu_id',
            [studentId, offeringId, date]
        );
        const randevuId = randevuRes.rows[0].randevu_id;

        await db.query(
            'INSERT INTO odeme (randevu_id, tutar) VALUES ($1, $2)',
            [randevuId, price]
        );
        res.status(201).json({ message: 'Randevu oluşturuldu' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateStatus = async (req, res) => {
    const { status } = req.body;
    try {
        await db.query('UPDATE randevu SET durum = $1 WHERE randevu_id = $2', [status, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addReview = async (req, res) => {
    const { teacherId, studentId, rating, comment, appointmentId } = req.body;
    try {
        try {
            await db.query('ALTER TABLE degerlendirme ADD COLUMN IF NOT EXISTS randevu_id INTEGER');
        } catch (e) { console.log('Column might already exist or error:', e.message); }

        const check = await db.query('SELECT * FROM degerlendirme WHERE randevu_id = $1', [appointmentId]);
        if (check.rows.length > 0) {
            return res.status(400).json({ error: 'Bu ders zaten değerlendirildi.' });
        }

        await db.query(
            'INSERT INTO degerlendirme (ogretmen_id, ogrenci_id, puan, yorum, randevu_id) VALUES ($1, $2, $3, $4, $5)',
            [teacherId, studentId, rating, comment, appointmentId]
        );

        const avgRes = await db.query('SELECT AVG(puan) as avg_puan FROM degerlendirme WHERE ogretmen_id = $1', [teacherId]);
        const newRating = Number(avgRes.rows[0].avg_puan).toFixed(2);

        await db.query('UPDATE ogretmen SET puan = $1 WHERE ogretmen_id = $2', [newRating, teacherId]);

        res.status(201).json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
