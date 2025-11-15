const express = require('express');
const router = express.Router();
const authController = require("../controllers/authController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const passport = require('passport');

// Register & login thường
router.post("/signup", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refreshToken);

// Xem profile (phải login mới xem được)
router.get("/profile", authMiddleware, authController.profile);

// Logout all devices (phải login)
router.post("/logout-all", authMiddleware, authController.logoutAllDevices);

router.get('/check-session', authMiddleware, authController.checkSession);

// Google OAuth
router.get("/google", 
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
    passport.authenticate("google", { failureRedirect: "http://localhost:5173/login" }),
    authController.googleCallback
);

module.exports = router;