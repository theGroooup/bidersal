const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

router.get('/lessons', teacherController.getAllLessons); // Global lessons list
router.get('/:id', teacherController.getProfile);
router.put('/:id', teacherController.updateProfile);

// Availability
router.get('/:id/availability', teacherController.getAvailability);
router.post('/availability', teacherController.updateAvailability);
router.delete('/availability/:id', teacherController.deleteAvailability);
router.get('/:id/busy-slots', teacherController.getBusySlots);

// Courses (Offerings)
router.get('/:id/courses', teacherController.getLessons);
router.post('/courses', teacherController.addLesson);
router.delete('/courses/:id', teacherController.deleteLesson);

module.exports = router;
