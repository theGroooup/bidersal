const db = require('../config/db');

exports.getFinancialRecords = async (req, res) => {
    try {
        const query = `
            SELECT r.randevu_id as id, r.randevu_tarihi_baslangic as date, r.durum as status,
            CONCAT(s.ad, ' ', s.soyad) as "studentName", CONCAT(t.ad, ' ', t.soyad) as "teacherName",
            o.tutar as amount, o.ogrenci_odeme_durumu as "studentPaymentStatus", o.ogretmen_odeme_durumu as "teacherPaymentStatus"
            FROM randevu r
            JOIN ogrenci s ON r.ogrenci_id = s.ogrenci_id
            JOIN ogretmen_ders od ON r.ogretmen_ders_id = od.ogretmen_ders_id
            JOIN ogretmen t ON od.ogretmen_id = t.ogretmen_id
            JOIN odeme o ON r.randevu_id = o.randevu_id
            ORDER BY r.randevu_tarihi_baslangic DESC
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.resolveFinancialRecord = async (req, res) => {
    const { action } = req.body;
    try {
        if (action === 'refund') {
            await db.query('UPDATE odeme SET ogrenci_odeme_durumu = \'İade Edildi\' WHERE randevu_id = $1', [req.params.id]);
        } else if (action === 'pay_teacher') {
            await db.query('UPDATE odeme SET ogretmen_odeme_durumu = \'Ödendi\' WHERE randevu_id = $1', [req.params.id]);
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getUsers = async (req, res) => {
    try {
        const s = await db.query("SELECT ogrenci_id as id, ad as name, soyad as surname, email, 'STUDENT' as role, hesap_durumu as \"accountStatus\", kayit_tarihi as \"joinDate\" FROM ogrenci");
        const t = await db.query("SELECT ogretmen_id as id, ad as name, soyad as surname, email, 'TEACHER' as role, hesap_durumu as \"accountStatus\", kayit_tarihi as \"joinDate\", dogum_tarihi as \"birthDate\", cinsiyet as gender FROM ogretmen");
        res.json([...s.rows, ...t.rows]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateUserStatus = async (req, res) => {
    const { role, status } = req.body;
    try {
        const table = role === 'STUDENT' ? 'ogrenci' : 'ogretmen';
        const idCol = role === 'STUDENT' ? 'ogrenci_id' : 'ogretmen_id';
        await db.query(`UPDATE ${table} SET hesap_durumu = $1 WHERE ${idCol} = $2`, [status, req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getPendingTeachers = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT ogretmen_id as id, ad as name, soyad as surname, universite as university, 
            bolum as department, meslek as profession, belge_url as "documentUrl" 
            FROM ogretmen WHERE dogrulandi_mi = FALSE
        `);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.verifyTeacher = async (req, res) => {
    const { verified } = req.body;
    try {
        if (verified) {
            await db.query('UPDATE ogretmen SET dogrulandi_mi = TRUE WHERE ogretmen_id = $1', [req.params.id]);
        } else {
            await db.query('UPDATE ogretmen SET hesap_durumu = \'askida\' WHERE ogretmen_id = $1', [req.params.id]);
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createLesson = async (req, res) => {
    const { name, category, level } = req.body;
    try {
        const check = await db.query('SELECT * FROM ders WHERE ders_adi = $1', [name]);
        if (check.rows.length > 0) {
            await db.query('UPDATE ders SET kategori=$1, seviye=$2, aktif_mi=TRUE WHERE ders_id=$3', [category, level, check.rows[0].ders_id]);
            res.status(200).json({ id: check.rows[0].ders_id });
        } else {
            const result = await db.query(
                'INSERT INTO ders (ders_adi, kategori, seviye) VALUES ($1, $2, $3) RETURNING ders_id as id',
                [name, category, level]
            );
            res.status(201).json(result.rows[0]);
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateLesson = async (req, res) => {
    const { name, category, level } = req.body;
    try {
        await db.query(
            'UPDATE ders SET ders_adi=$1, kategori=$2, seviye=$3 WHERE ders_id=$4',
            [name, category, level, req.params.id]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteLesson = async (req, res) => {
    try {
        await db.query('UPDATE ders SET aktif_mi = FALSE WHERE ders_id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getStats = async (req, res) => {
    try {
        const totalAppointments = await db.query('SELECT COUNT(*) FROM randevu');
        const totalRevenue = await db.query('SELECT SUM(tutar) FROM odeme WHERE ogrenci_odeme_durumu = \'Ödendi\'');
        const totalStudents = await db.query('SELECT COUNT(*) FROM ogrenci');
        const totalTeachers = await db.query('SELECT COUNT(*) FROM ogretmen');
        const pendingTeachers = await db.query('SELECT COUNT(*) FROM ogretmen WHERE dogrulandi_mi = FALSE');

        res.json({
            totalAppointments: parseInt(totalAppointments.rows[0].count),
            totalRevenue: parseFloat(totalRevenue.rows[0].sum || 0),
            totalUsers: parseInt(totalStudents.rows[0].count) + parseInt(totalTeachers.rows[0].count),
            activeTeachers: parseInt(totalTeachers.rows[0].count) - parseInt(pendingTeachers.rows[0].count),
            pendingTeachers: parseInt(pendingTeachers.rows[0].count)
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
