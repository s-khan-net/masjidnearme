const rateLimit = require('express-rate-limit');

exports.searchLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    statusCode: 403,
    message: { error: 'Search request limit exceeded, please wait for some time and try again' }
});

