

function roleMiddleware( role = []) {
    return (req, res, next) => {
        if(!req.user) {
            return res.status(401).json({ message: "Vui lòng đang nhập!"});
        } if(!role.includes(req.user.role) && (!req.user.admin && role.includes("admin"))) {
            return res.status(403).json({ message: " Bạn Không có quyền truy cập!"});
        }
        next();
    }
}

module.exports = roleMiddleware;