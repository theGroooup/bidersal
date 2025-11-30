const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const upload = require('../middleware/upload');

router.post('/login', authController.login);
router.post('/register', upload.single('document'), authController.register);

module.exports = router;
