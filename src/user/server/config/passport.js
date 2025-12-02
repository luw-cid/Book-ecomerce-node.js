require('dotenv').config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");

const API_URL = process.env.API_URL;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Kiểm tra biến môi trường
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment variables.");
}

// passport config
passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: `${API_URL}/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({googleId: profile.id});
                // Kiểm tra user đã tồn tại chưa
                if(!user) {
                    // Tạo user mới với thông tin từ Google
                    user = await User.create({
                        googleId: profile.id,
                        displayName: profile.displayName,
                        fullName: profile.displayName,
                        email: profile.emails[0].value,
                        avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined,
                    });
                }

                // Vẫn trả về user object để googleCallback có thể kiểm tra isBanned
                // googleCallback sẽ xử lý việc redirect với thông báo lỗi nếu user bị ban
                return done(null, user); // lưu thông tin user vào session
                
            } catch (err) {
                return done(err, null);
            }
        }
    )
);
//Serialize user -> lưu thông tin user vào session
passport.serializeUser((user, done) => {done(null, user.id)});
//Deserialize user -> lấy user từ session để sử dụng cho request tiếp theo
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user)
    } catch (err) {
        done(err, null);
    }
});

// app.use(
//     session({
//         secret: "secretkey",
//         resave: false,
//         saveUninitialized: true,
//     })
// );

module.exports = passport;