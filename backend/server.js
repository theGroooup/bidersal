
const express = require('express');
const cors = require('cors');
const db = require('./db');

const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// --- AUTH ---
// ... (existing code)

// --- ADMIN DISPUTES ---
app.get('/api/admin/disputes', async (req, res) => {
    try {
        // Mock logic: Get appointments that are cancelled or have issues
        // In a real app, we might have a separate 'disputes' table or a 'is_disputed' flag
        // For now, let's fetch cancelled appointments where payment might be an issue
        const query = `
            SELECT r.randevu_id as id, r.randevu_tarihi_baslangic as date, r.durum as status,
            CONCAT(s.ad, ' ', s.soyad) as "studentName", CONCAT(t.ad, ' ', t.soyad) as "teacherName",
            o.tutar as amount, o.ogrenci_odeme_durumu as "paymentStatus"
            FROM randevu r
            JOIN ogrenci s ON r.ogrenci_id = s.ogrenci_id
            JOIN ogretmen_ders od ON r.ogretmen_ders_id = od.ogretmen_ders_id
            JOIN ogretmen t ON od.ogretmen_id = t.ogretmen_id
            JOIN odeme o ON r.randevu_id = o.randevu_id
            WHERE r.durum IN ('Öğrenci İptal', 'Öğretmen İptal') OR o.ogrenci_odeme_durumu = 'İade Bekliyor'
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/disputes/:id/resolve', async (req, res) => {
    const { action } = req.body; // 'refund' or 'pay_teacher'
    try {
        if (action === 'refund') {
            await db.query('UPDATE odeme SET ogrenci_odeme_durumu = \'İade Edildi\' WHERE randevu_id = $1', [req.params.id]);
        } else if (action === 'pay_teacher') {
            await db.query('UPDATE odeme SET ogretmen_odeme_durumu = \'Ödendi\' WHERE randevu_id = $1', [req.params.id]);
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- TEACHER UPLOAD ---
app.post('/api/teacher/:id/upload-document', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Dosya yüklenmedi' });

        const fileUrl = `/uploads/${req.file.filename}`;
        await db.query('UPDATE ogretmen SET belge_url = $1 WHERE ogretmen_id = $2', [fileUrl, req.params.id]);

        res.json({ success: true, fileUrl });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update pending teachers to include document
app.get('/api/teachers/pending', async (req, res) => {
    const result = await db.query(`
        SELECT ogretmen_id as id, ad as name, soyad as surname, universite as university, 
        bolum as department, meslek as profession, belge_url as "documentUrl" 
        FROM ogretmen WHERE dogrulandi_mi = FALSE
    `);
    res.json(result.rows);
});

// --- ADMIN LESSONS ---
app.post('/api/login', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        let table = role === 'STUDENT' ? 'ogrenci' : role === 'TEACHER' ? 'ogretmen' : 'admin';
        let idField = role === 'STUDENT' ? 'ogrenci_id' : role === 'TEACHER' ? 'ogretmen_id' : 'admin_id';

        const result = await db.query(`SELECT * FROM ${table} WHERE email = $1`, [email]);
        if (result.rows.length === 0 || result.rows[0].sifre_hash !== password) {
            return res.status(401).json({ error: 'Hatalı e-posta veya şifre' });
        }
        const user = result.rows[0];
        res.json({
            id: user[idField],
            name: user.ad,
            surname: user.soyad,
            email: user.email,
            role: role,
            accountStatus: user.hesap_durumu || 'aktif',
            joinDate: user.kayit_tarihi
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/register', async (req, res) => {
    const { role, name, surname, email, password, phone } = req.body;
    try {
        let query = '', values = [];
        if (role === 'STUDENT') {
            query = 'INSERT INTO ogrenci (ad, soyad, email, sifre_hash, tel_no, dogum_tarihi, cinsiyet) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ogrenci_id as id';
        } else {
            query = 'INSERT INTO ogretmen (ad, soyad, email, sifre_hash, tel_no, dogum_tarihi, cinsiyet) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ogretmen_id as id';
        }
        // Note: birthDate and gender will be undefined/null for teachers, which is fine as they are not in the query for teachers
        const { birthDate, gender } = req.body;
        res.status(201).json({ userId: result.rows[0].id });
    } catch (err) { res.status(500).json({ error: 'Kayıt oluşturulamadı. E-posta kullanımda olabilir.' }); }
});

// --- COMMON ---
app.get('/api/offerings', async (req, res) => {
    const query = `
        SELECT od.ogretmen_ders_id as id, o.ogretmen_id as "teacherId", d.ders_id as "subjectId",
        od.saatlik_ucret as "hourlyRate", d.ders_adi as "subjectName", d.kategori as "category",
        o.ad as "teacherName", o.soyad as "teacherSurname", o.universite, o.puan as rating, o.biyografi as bio
        FROM ogretmen_ders od
        JOIN ogretmen o ON od.ogretmen_id = o.ogretmen_id
        JOIN ders d ON od.ders_id = d.ders_id
        WHERE o.hesap_durumu = 'aktif' AND od.aktif_mi = TRUE
    `;
    const result = await db.query(query);
    res.json(result.rows);
});

app.get('/api/subjects', async (req, res) => {
    const result = await db.query('SELECT ders_id as id, ders_adi as name, kategori as category FROM ders WHERE aktif_mi = TRUE');
    res.json(result.rows);
});

// --- STUDENT ENDPOINTS ---
app.get('/api/student/:id', async (req, res) => {
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
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/appointments/student/:id', async (req, res) => {
    const query = `
        SELECT r.randevu_id as id, r.randevu_tarihi_baslangic as date, r.sure_dakika as "durationMinutes",
        r.durum as status, r.zoom_linki as "zoomLink",
        CONCAT(o.ad, ' ', o.soyad) as "teacherName", d.ders_adi as "subjectName", od.saatlik_ucret as price,
        o.ogretmen_id as "teacherId"
        FROM randevu r
        JOIN ogretmen_ders od ON r.ogretmen_ders_id = od.ogretmen_ders_id
        JOIN ogretmen o ON od.ogretmen_id = o.ogretmen_id
        JOIN ders d ON od.ders_id = d.ders_id
        WHERE r.ogrenci_id = $1 ORDER BY r.randevu_tarihi_baslangic DESC
    `;
    const result = await db.query(query, [req.params.id]);
    res.json(result.rows);
});

app.post('/api/appointments', async (req, res) => {
    const { studentId, offeringId, date } = req.body;
    try {
        // Fiyatı ve aktiflik durumunu al
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
});

app.post('/api/reviews', async (req, res) => {
    const { teacherId, studentId, rating, comment } = req.body;
    try {
        // Yorum ekle
        await db.query(
            'INSERT INTO degerlendirme (ogretmen_id, ogrenci_id, puan, yorum) VALUES ($1, $2, $3, $4)',
            [teacherId, studentId, rating, comment]
        );

        // Öğretmen puanını güncelle (Ortalama)
        const avgRes = await db.query('SELECT AVG(puan) as avg_puan FROM degerlendirme WHERE ogretmen_id = $1', [teacherId]);
        const newRating = Number(avgRes.rows[0].avg_puan).toFixed(2);

        await db.query('UPDATE ogretmen SET puan = $1 WHERE ogretmen_id = $2', [newRating, teacherId]);

        res.status(201).json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/payments/student/:id', async (req, res) => {
    const query = `
        SELECT o.odeme_id as id, o.tutar as amount, o.ogrenci_odeme_durumu as status, r.randevu_tarihi_baslangic as date, d.ders_adi as "subjectName"
        FROM odeme o
        JOIN randevu r ON o.randevu_id = r.randevu_id
        JOIN ogretmen_ders od ON r.ogretmen_ders_id = od.ogretmen_ders_id
        JOIN ders d ON od.ders_id = d.ders_id
        WHERE r.ogrenci_id = $1
    `;
    const result = await db.query(query, [req.params.id]);
    res.json(result.rows);
});

app.put('/api/student/:id', async (req, res) => {
    const { name, surname, phone, grade, birthDate, gender } = req.body;
    await db.query(
        'UPDATE ogrenci SET ad=$1, soyad=$2, tel_no=$3, sinif=$4, dogum_tarihi=$5, cinsiyet=$6 WHERE ogrenci_id=$7',
        [name, surname, phone, grade, birthDate, gender, req.params.id]
    );
    res.json({ success: true });
});

// --- TEACHER ENDPOINTS ---
app.get('/api/appointments/teacher/:id', async (req, res) => {
    const query = `
        SELECT r.randevu_id as id, r.randevu_tarihi_baslangic as date, r.sure_dakika as "durationMinutes",
        r.durum as status, CONCAT(st.ad, ' ', st.soyad) as "studentName", d.ders_adi as "subjectName", od.saatlik_ucret as price
        FROM randevu r
        JOIN ogrenci st ON r.ogrenci_id = st.ogrenci_id
        JOIN ogretmen_ders od ON r.ogretmen_ders_id = od.ogretmen_ders_id
        JOIN ders d ON od.ders_id = d.ders_id
        WHERE od.ogretmen_id = $1 ORDER BY r.randevu_tarihi_baslangic
    `;
    const result = await db.query(query, [req.params.id]);
    res.json(result.rows);
});

app.put('/api/appointments/:id/status', async (req, res) => {
    const { status } = req.body;
    await db.query('UPDATE randevu SET durum = $1 WHERE randevu_id = $2', [status, req.params.id]);

    // Eğer randevu tamamlandıysa ödemeyi 'Ödendi' yap
    if (status === 'Tamamlandı') {
        await db.query('UPDATE odeme SET ogrenci_odeme_durumu = $1, ogretmen_odeme_durumu = $1 WHERE randevu_id = $2', ['Ödendi', req.params.id]);
    }
    // Eğer randevu iptal edildiyse ödemeyi 'İptal Edildi' yap
    else if (status === 'Öğrenci İptal' || status === 'Öğretmen İptal') {
        await db.query('UPDATE odeme SET ogrenci_odeme_durumu = $1, ogretmen_odeme_durumu = $1 WHERE randevu_id = $2', ['İptal Edildi', req.params.id]);
    }

    res.json({ success: true });
});

app.get('/api/teacher/:id/courses', async (req, res) => {
    const query = `
        SELECT od.ogretmen_ders_id as id, d.ders_adi as "subjectName", d.kategori as category, od.saatlik_ucret as "hourlyRate"
        FROM ogretmen_ders od JOIN ders d ON od.ders_id = d.ders_id
        WHERE od.ogretmen_id = $1 AND od.aktif_mi = TRUE
    `;
    const result = await db.query(query, [req.params.id]);
    res.json(result.rows);
});

app.post('/api/teacher/courses', async (req, res) => {
    const { teacherId, subjectId, hourlyRate } = req.body;
    try {
        // Check if course exists (active or inactive)
        const check = await db.query('SELECT * FROM ogretmen_ders WHERE ogretmen_id = $1 AND ders_id = $2', [teacherId, subjectId]);
        if (check.rows.length > 0) {
            // Update existing record (reactivate if inactive)
            await db.query('UPDATE ogretmen_ders SET saatlik_ucret = $1, aktif_mi = TRUE WHERE ogretmen_ders_id = $2', [hourlyRate, check.rows[0].ogretmen_ders_id]);
        } else {
            // Insert new record
            await db.query('INSERT INTO ogretmen_ders (ogretmen_id, ders_id, saatlik_ucret) VALUES ($1, $2, $3)', [teacherId, subjectId, hourlyRate]);
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Ders eklenemedi' }); }
});

app.delete('/api/teacher/courses/:id', async (req, res) => {
    await db.query('UPDATE ogretmen_ders SET aktif_mi = FALSE WHERE ogretmen_ders_id = $1', [req.params.id]);
    res.json({ success: true });
});

// Çalışma Saatleri
app.get('/api/teacher/:id/availability', async (req, res) => {
    const result = await db.query('SELECT * FROM ogretmen_calisma_saatleri WHERE ogretmen_id = $1', [req.params.id]);
    res.json(result.rows);
});

app.post('/api/teacher/availability', async (req, res) => {
    const { teacherId, day, start, end } = req.body;
    try {
        // Varsa güncelle yoksa ekle (Upsert benzeri logic)
        const check = await db.query('SELECT * FROM ogretmen_calisma_saatleri WHERE ogretmen_id = $1 AND gun_no = $2', [teacherId, day]);
        if (check.rows.length > 0) {
            await db.query('UPDATE ogretmen_calisma_saatleri SET baslangic_saati=$1, bitis_saati=$2 WHERE ogretmen_id=$3 AND gun_no=$4', [start, end, teacherId, day]);
        } else {
            await db.query('INSERT INTO ogretmen_calisma_saatleri (ogretmen_id, gun_no, baslangic_saati, bitis_saati) VALUES ($1, $2, $3, $4)', [teacherId, day, start, end]);
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/teacher/availability/:id', async (req, res) => {
    // ID = calisma_saati_id
    await db.query('DELETE FROM ogretmen_calisma_saatleri WHERE calisma_saati_id = $1', [req.params.id]);
    res.json({ success: true });
});

app.get('/api/payments/teacher/:id', async (req, res) => {
    const query = `
        SELECT o.odeme_id as id, o.tutar as amount, o.ogretmen_odeme_durumu as status, r.randevu_tarihi_baslangic as date, d.ders_adi as "subjectName"
        FROM odeme o
        JOIN randevu r ON o.randevu_id = r.randevu_id
        JOIN ogretmen_ders od ON r.ogretmen_ders_id = od.ogretmen_ders_id
        JOIN ders d ON od.ders_id = d.ders_id
        WHERE od.ogretmen_id = $1
    `;
    const result = await db.query(query, [req.params.id]);
    res.json(result.rows);
});

app.get('/api/teacher/:id', async (req, res) => {
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
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/teacher/:id', async (req, res) => {
    const { name, surname, phone, university, department, profession, bio, birthDate, gender } = req.body;
    await db.query(
        'UPDATE ogretmen SET ad=$1, soyad=$2, tel_no=$3, universite=$4, bolum=$5, meslek=$6, biyografi=$7, dogum_tarihi=$8, cinsiyet=$9 WHERE ogretmen_id=$10',
        [name, surname, phone, university, department, profession, bio, birthDate, gender, req.params.id]
    );
    res.json({ success: true });
});

// --- ADMIN ENDPOINTS ---
app.get('/api/admin/users', async (req, res) => {
    const s = await db.query("SELECT ogrenci_id as id, ad as name, soyad as surname, email, 'STUDENT' as role, hesap_durumu as \"accountStatus\", kayit_tarihi as \"joinDate\" FROM ogrenci");
    const t = await db.query("SELECT ogretmen_id as id, ad as name, soyad as surname, email, 'TEACHER' as role, hesap_durumu as \"accountStatus\", kayit_tarihi as \"joinDate\", dogum_tarihi as \"birthDate\", cinsiyet as gender FROM ogretmen");
    res.json([...s.rows, ...t.rows]);
});

app.put('/api/users/:id/status', async (req, res) => {
    const { role, status } = req.body;
    const table = role === 'STUDENT' ? 'ogrenci' : 'ogretmen';
    const idCol = role === 'STUDENT' ? 'ogrenci_id' : 'ogretmen_id';
    await db.query(`UPDATE ${table} SET hesap_durumu = $1 WHERE ${idCol} = $2`, [status, req.params.id]);
    res.json({ success: true });
});

app.get('/api/teachers/pending', async (req, res) => {
    const result = await db.query(`
        SELECT ogretmen_id as id, ad as name, soyad as surname, universite as university, 
        bolum as department, meslek as profession FROM ogretmen WHERE dogrulandi_mi = FALSE
    `);
    res.json(result.rows);
});

app.put('/api/teachers/:id/verify', async (req, res) => {
    const { verified } = req.body;
    if (verified) {
        await db.query('UPDATE ogretmen SET dogrulandi_mi = TRUE WHERE ogretmen_id = $1', [req.params.id]);
    } else {
        await db.query('UPDATE ogretmen SET hesap_durumu = \'askida\' WHERE ogretmen_id = $1', [req.params.id]);
    }
    res.json({ success: true });
});

// --- ADMIN LESSONS ---
app.post('/api/admin/lessons', async (req, res) => {
    const { name, category, level } = req.body;
    try {
        // Check if lesson exists (by name)
        const check = await db.query('SELECT * FROM ders WHERE ders_adi = $1', [name]);
        if (check.rows.length > 0) {
            // If exists, update it
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
});

app.put('/api/admin/lessons/:id', async (req, res) => {
    const { name, category, level } = req.body;
    try {
        await db.query(
            'UPDATE ders SET ders_adi=$1, kategori=$2, seviye=$3 WHERE ders_id=$4',
            [name, category, level, req.params.id]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/lessons/:id', async (req, res) => {
    try {
        await db.query('UPDATE ders SET aktif_mi = FALSE WHERE ders_id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- ADMIN REPORTING ---
app.get('/api/admin/stats', async (req, res) => {
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
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
