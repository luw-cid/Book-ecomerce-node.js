const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/profile', userController.getProfile);

router.put('/profile', userController.updateProfile);

router.put('/change-password', userController.changePassword);

router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);

router.put('/preference', userController.updatePreferences);

module.exports = router;