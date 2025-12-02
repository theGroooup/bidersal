const db = require('../config/db');

exports.getStudentPayments = async (req, res) => {
    const query = `
        SELECT o.odeme_id as id, o.tutar as amount, o.ogrenci_odeme_durumu as status, r.randevu_tarihi_baslangic as date, d.ders_adi as "subjectName",
        o.ogrenci_odeme_tarihi as "paymentDate"
        FROM odeme o
        JOIN randevu r ON o.randevu_id = r.randevu_id
        JOIN ogretmen_ders od ON r.ogretmen_ders_id = od.ogretmen_ders_id
        JOIN ders d ON od.ders_id = d.ders_id
        WHERE r.ogrenci_id = $1 AND r.durum != 'Bekliyor'
    `;
    try {
        const result = await db.query(query, [req.params.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTeacherPayments = async (req, res) => {
    const query = `
        SELECT o.odeme_id as id, o.tutar as amount, o.ogretmen_odeme_durumu as status, r.randevu_tarihi_baslangic as date, d.ders_adi as "subjectName", o.is_withdrawed,
        o.ogretmen_odeme_tarihi as "withdrawalDate"
        FROM odeme o
        JOIN randevu r ON o.randevu_id = r.randevu_id
        JOIN ogretmen_ders od ON r.ogretmen_ders_id = od.ogretmen_ders_id
        JOIN ders d ON od.ders_id = d.ders_id
        WHERE od.ogretmen_id = $1 AND r.durum != 'Bekliyor'
    `;
    try {
        const result = await db.query(query, [req.params.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.withdrawPayment = async (req, res) => {
    const { paymentId } = req.body;
    try {
        // Set withdrawal date to NOW()
        await db.query('UPDATE odeme SET is_withdrawed = TRUE, ogretmen_odeme_tarihi = NOW() WHERE odeme_id = $1', [paymentId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.payPayment = async (req, res) => {
    const { paymentId } = req.body;
    try {
        // Set student payment date to NOW()
        await db.query('UPDATE odeme SET ogrenci_odeme_durumu = $1, ogrenci_odeme_tarihi = NOW() WHERE odeme_id = $2', ['Ödendi', paymentId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
