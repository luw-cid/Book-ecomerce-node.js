const passport = require('passport');
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const authController = require('../services/authService');

const app = express();


