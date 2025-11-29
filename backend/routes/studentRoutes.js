const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.get('/offerings', studentController.getOfferings);
router.get('/:id', studentController.getProfile);
router.put('/:id', studentController.updateProfile);

module.exports = router;
