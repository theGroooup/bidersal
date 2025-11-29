const db = require('../config/db');

exports.getProfile = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM ogrenci WHERE ogrenci_id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Öğrenci bulunamadı' });

        const user = result.rows[0];
        res.json({
            id: user.ogrenci_id,
            name: user.ad,
            surname: user.soyad,
            email: user.email,
            phone: user.tel_no,
            grade: user.sinif,
            birthDate: user.dogum_tarihi,
            gender: user.cinsiyet
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    const { name, surname, phone, grade, birthDate, gender } = req.body;
    try {
        await db.query(
            'UPDATE ogrenci SET ad=$1, soyad=$2, tel_no=$3, sinif=$4, dogum_tarihi=$5, cinsiyet=$6 WHERE ogrenci_id=$7',
            [name, surname, phone, grade, birthDate, gender, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getOfferings = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT od.ogretmen_ders_id as id, d.ders_adi as "subjectName", 
            o.ad as "teacherName", o.soyad as "teacherSurname", od.saatlik_ucret as "hourlyRate",
            o.ogretmen_id as "teacherId"
            FROM ogretmen_ders od
            JOIN ogretmen o ON od.ogretmen_id = o.ogretmen_id
            JOIN ders d ON od.ders_id = d.ders_id
            WHERE od.aktif_mi = TRUE
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
