const express = require('express');
const verifyJWT = require('../../middleware/verifyJWT');
const router = express.Router();
const userController = require('../../controllers/userController');

// Route for getting user info
router.post('/', verifyJWT, userController.getUserInfo);

// Route for editing a user
router.put('/:id', verifyJWT, userController.editUser);

// Route for deleting a user
router.delete('/:id', verifyJWT, userController.deleteUser);

router.get('/', verifyJWT , userController.findAll);

module.exports = router;