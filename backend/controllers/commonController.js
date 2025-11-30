const db = require('../config/db');

exports.getOfferings = async (req, res) => {
    const query = `
        SELECT od.ogretmen_ders_id as id, o.ogretmen_id as "teacherId", d.ders_id as "subjectId",
        od.saatlik_ucret as "hourlyRate", d.ders_adi as "subjectName", d.kategori as "category",
        o.ad as "teacherName", o.soyad as "teacherSurname", o.universite, o.puan as rating, o.biyografi as bio
        FROM ogretmen_ders od
        JOIN ogretmen o ON od.ogretmen_id = o.ogretmen_id
        JOIN ders d ON od.ders_id = d.ders_id
        WHERE o.hesap_durumu = 'aktif' AND od.aktif_mi = TRUE
    `;
    try {
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getSubjects = async (req, res) => {
    try {
        const result = await db.query('SELECT ders_id as id, ders_adi as name, kategori as category FROM ders WHERE aktif_mi = TRUE');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};
