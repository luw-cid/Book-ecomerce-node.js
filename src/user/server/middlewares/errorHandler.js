// Middleware xử lý lỗi tổng quát cho Express
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        status: err.status || 'error',
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && {stack: err.stack})
        }
    });
}

module.exports = errorHandler;