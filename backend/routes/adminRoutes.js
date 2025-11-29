const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/financial-management', adminController.getFinancialRecords);
router.post('/financial-management/:id/resolve', adminController.resolveFinancialRecord);
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus); // Note: Original path was /api/users/:id/status, mapping here
router.get('/teachers/pending', adminController.getPendingTeachers); // Original: /api/teachers/pending
router.put('/teachers/:id/verify', adminController.verifyTeacher); // Original: /api/teachers/:id/verify
router.post('/lessons', adminController.createLesson);
router.put('/lessons/:id', adminController.updateLesson);
router.delete('/lessons/:id', adminController.deleteLesson);
router.get('/stats', adminController.getStats);

module.exports = router;
