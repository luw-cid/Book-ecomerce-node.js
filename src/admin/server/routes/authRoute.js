const express = require('express');
const router = express.Router();
const authController = require("../controllers/authController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { adminMiddleware } = require("../middlewares/roleMiddleware");

// ==================== ADMIN ROUTES ====================
// Root endpoint - hiển thị thông tin API
router.get("/", (req, res) => {
    res.json({ 
        message: "Admin Authentication API",
        endpoints: {
            login: "POST /auth/login - Admin login endpoint",
            profile: "GET /auth/profile - Get admin profile (requires auth)"
        }
    });
});

// Admin login endpoint
router.post("/login", authController.loginAdmin);

// ==================== PROTECTED ROUTES ====================
// Xem profile admin (phải login và có quyền admin)
router.get("/profile", authMiddleware, adminMiddleware, authController.profile);

module.exports = router;