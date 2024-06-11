const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyJWT = require('../middleware/verifyJWT');

router.post('/', verifyJWT , authController.handleLoginWithTkn);

module.exports = router;