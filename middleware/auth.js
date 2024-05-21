const jwt = require('jsonwebtoken');
require('dotenv').config()

module.exports = function (req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access denied. No token provided');

    try {
        const verify = jwt.verify(token, process.env.jwtKey);
        if (verify.type === 'user') {
            req.userId = verify.userId
            next();
        }
        else { return res.status(401).send('Access denied. No token provided'); };
    }
    catch (ex) {
        res.status(400).send('Access denied. Invalid token');
    }
}