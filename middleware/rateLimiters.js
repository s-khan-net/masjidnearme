const rateLimit = require('express-rate-limit');

exports.searchLimiter = rateLimit({
    windowsMs: 10 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    message: {
        success: false,
        message: 'Search request limit exceeded, please wait for some time and try again'
    }
});

