// middlewares/roleMiddleware.js
// Middleware kiểm tra quyền admin
function adminMiddleware(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ 
            success: false,
            message: "Vui lòng đăng nhập!" 
        });
    }
    
    if (!req.user.admin) {
        return res.status(403).json({ 
            success: false,
            message: "Bạn không có quyền truy cập! Chỉ admin mới được phép." 
        });
    }
    
    next();
}

// Middleware kiểm tra role chung (có thể mở rộng sau)
function roleMiddleware(roles = []) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: "Vui lòng đăng nhập!" 
            });
        }
        
        // Kiểm tra nếu roles có "admin" và user có admin = true
        if (roles.includes("admin") && req.user.admin) {
            return next();
        }
        
        // Kiểm tra role thông thường (nếu có)
        if (req.user.role && roles.includes(req.user.role)) {
            return next();
        }
        
        return res.status(403).json({ 
            success: false,
            message: "Bạn không có quyền truy cập!" 
        });
    };
}

module.exports = { roleMiddleware, adminMiddleware };