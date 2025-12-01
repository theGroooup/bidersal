const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('./config/db'); // Import db for upload logic
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Uploads Config
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static('uploads'));

const upload = require('./middleware/upload');

// Routes
app.use('/api', require('./routes/authRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/teacher', require('./routes/teacherRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api', require('./routes/commonRoutes')); // Mounts /offerings and /subjects directly under /api

// Special Routes (Manual mapping for exact match or Multer)
app.post('/api/teacher/:id/upload-document', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Dosya yüklenmedi' });
        const fileUrl = `/uploads/${req.file.filename}`;
        await db.query('UPDATE ogretmen SET belge_url = $1 WHERE ogretmen_id = $2', [fileUrl, req.params.id]);
        res.json({ success: true, fileUrl });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Fix for /api/reviews (Original was /api/reviews, new is /api/appointments/review)
// We can re-route or just add a specific route here
const appointmentController = require('./controllers/appointmentController');
app.post('/api/reviews', appointmentController.addReview);

// Fix for Admin Routes that were not under /api/admin in original
const adminController = require('./controllers/adminController');
app.put('/api/users/:id/status', adminController.updateUserStatus);
app.get('/api/teachers/pending', adminController.getPendingTeachers);
app.put('/api/teachers/:id/verify', adminController.verifyTeacher);

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
