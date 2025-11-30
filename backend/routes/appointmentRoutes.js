const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.get('/student/:id', appointmentController.getStudentAppointments);
router.get('/teacher/:id', appointmentController.getTeacherAppointments);
router.post('/', appointmentController.createAppointment);
router.put('/:id/status', appointmentController.updateStatus);
router.post('/review', appointmentController.addReview); // Note: Original was /api/reviews, mapping here for consistency

module.exports = router;
