const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/student/:id', paymentController.getStudentPayments);
router.get('/teacher/:id', paymentController.getTeacherPayments);
router.post('/teacher/withdraw', paymentController.withdrawPayment);
router.post('/pay', paymentController.payPayment);

module.exports = router;
