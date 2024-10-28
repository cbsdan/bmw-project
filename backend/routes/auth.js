const express = require('express');
const router = express.Router();
const upload = require("../utils/multer");
const {isAuthenticatedUser, isAdmin} = require("../middleware/auth") 

const { 
    registerUser,
    loginUser,
    getAllUsers,
    getUserDetails,
    updateUser,
    updateUserAvatar,
    updateUserPassword
} = require('../controllers/auth');

router.post('/register', upload.single('avatar'), registerUser);
router.post('/login', loginUser);
router.get('/admin/all-users', isAdmin, getAllUsers);
router.get('/admin/user/:id', isAdmin, getUserDetails);
router.put('/admin/update-user/:id', isAdmin, updateUser);
router.put('/admin/update-avatar/:id', upload.single('avatar'), updateUserAvatar);
router.put('/admin/update-password/:id', updateUserPassword);


module.exports = router;
