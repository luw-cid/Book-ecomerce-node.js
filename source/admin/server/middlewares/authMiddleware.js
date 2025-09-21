// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

function authMiddleware ( req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if(!token) return res.status(401).json({ message: "Vui lòng đăng nhập để thực hiện chức năng!"});

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) // verify token với secret
        req.user = decoded // Gắn thông tin user,(id, email, admin) vào req để controller dùng
        next();
    } catch (err) {
        return res.status(403).json({ message: "Token không hợp lệ"});
    }
}

module.exports = authMiddleware;
