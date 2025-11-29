const express = require('express');
const router = express.Router();
const commonController = require('../controllers/commonController');

router.get('/offerings', commonController.getOfferings);
router.get('/subjects', commonController.getSubjects);

module.exports = router;
