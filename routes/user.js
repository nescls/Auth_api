const express = require('express');
const router = express.Router();

const verifyJWT = require('../middleware/verifyJWT');
const { findAll } = require('../controllers/userController');

router.get('/findAll', verifyJWT , findAll);

module.exports = router;