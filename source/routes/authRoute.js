const express = require('express');
const router = express.Router();
const authController = require("../controllers/authController");
const passport = require('passport');

// Sửa app.get thành router.get
router.get("/", (req, res) => {
    res.send("<a href='/google'>Login with Google</a>");
});

// Register & login thường
router.get("/register", (req, res) => res.render("register"));
router.post("/register", authController.register);

router.get("/login", (req, res) => res.render("login"));
router.post("/login", authController.login);

// Google Login
router.get("/google", 
    passport.authenticate("google", {scope: ["profile", "email"]})
);

router.get("/google/callback",
    passport.authenticate("google", {failureRedirect: "/"}),
    (req, res) => {
        res.redirect("/profile");
    }
);

module.exports = router;