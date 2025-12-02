const db = require('../config/db');

exports.getStudentAppointments = async (req, res) => {

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
        const priceRes = await db.query('SELECT saatlik_ucret, aktif_mi, ogretmen_id FROM ogretmen_ders WHERE ogretmen_ders_id = $1', [offeringId]);
        if (priceRes.rows.length === 0 || !priceRes.rows[0].aktif_mi) {
            return res.status(400).json({ error: 'Bu ders artık aktif değil.' });
        }
        const price = priceRes.rows[0].saatlik_ucret;
        const teacherId = priceRes.rows[0].ogretmen_id; // Need to fetch teacherId too

        // 1. Check Teacher Availability (Working Hours)
        const appointmentDate = new Date(date);
        const dayOfWeek = appointmentDate.getDay() || 7; // JS: 0=Sun, 1=Mon... DB: 1=Mon...7=Sun (usually)
        // Let's assume DB uses 1=Mon, 7=Sun. JS getDay() returns 0 for Sun.
        // So if getDay() is 0, we use 7. Else use getDay().

        const timeString = appointmentDate.toTimeString().split(' ')[0].substring(0, 5); // "HH:MM"

        const workHours = await db.query(
            'SELECT * FROM ogretmen_calisma_saatleri WHERE ogretmen_id = $1 AND gun_no = $2',
            [teacherId, dayOfWeek]
        );

        if (workHours.rows.length === 0) {
            return res.status(400).json({ error: 'Öğretmen bu gün çalışmıyor.' });
        }

        const { baslangic_saati, bitis_saati } = workHours.rows[0];
        if (timeString < baslangic_saati || timeString >= bitis_saati) {
            return res.status(400).json({ error: 'Seçilen saat öğretmenin çalışma saatleri dışında.' });
        }

        // 2. Check for Conflicts (Overlapping Appointments)
        // Assuming 1 hour duration for now, or we should get duration from somewhere.
        // The report says "sure_dakika". Let's assume default 60 mins if not specified.
        const duration = 60;

        const conflict = await db.query(`
            SELECT * FROM randevu r
            JOIN ogretmen_ders od ON r.ogretmen_ders_id = od.ogretmen_ders_id
            WHERE od.ogretmen_id = $1
            AND r.durum NOT IN ('Öğrenci İptal', 'Öğretmen İptal')
            AND (
                (r.randevu_tarihi_baslangic <= $2 AND r.randevu_tarihi_baslangic + (r.sure_dakika || ' minutes')::interval > $2)
                OR
                (r.randevu_tarihi_baslangic < $3 AND r.randevu_tarihi_baslangic + (r.sure_dakika || ' minutes')::interval >= $3)
            )
        `, [teacherId, date, new Date(appointmentDate.getTime() + duration * 60000).toISOString()]);

        if (conflict.rows.length > 0) {
            return res.status(400).json({ error: 'Bu saatte öğretmenin başka bir randevusu var.' });
        }

        const randevuRes = await db.query(
            'INSERT INTO randevu (ogrenci_id, ogretmen_ders_id, randevu_tarihi_baslangic, sure_dakika) VALUES ($1, $2, $3, $4) RETURNING randevu_id',
            [studentId, offeringId, date, duration]
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

        if (status === 'Öğrenci İptal' || status === 'Öğretmen İptal') {
            await db.query('DELETE FROM odeme WHERE randevu_id = $1', [req.params.id]);
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addReview = async (req, res) => {
    const { teacherId, studentId, rating, comment, appointmentId } = req.body;
    try {

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
