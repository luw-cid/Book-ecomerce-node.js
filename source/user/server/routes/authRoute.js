const express = require('express');
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const passport = require('passport');

// Register & login thường
router.post("/signup", authController.register);
router.post("/login", authController.login);

// Xem profile (phải login mới xem được)
router.get("/profile", authMiddleware, authController.profile);

// Google OAuth
router.get("/google", 
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
    passport.authenticate("google", { failureRedirect: "http://localhost:5173/login" }),
    authController.googleCallback
);

module.exports = router;