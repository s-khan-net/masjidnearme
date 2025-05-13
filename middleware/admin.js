const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
require('dotenv').config()

module.exports = async function (req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access denied. No token provided');
    try {
        const verify = jwt.verify(token.split('Bearer ')[1], process.env.jwtKey);
        if (verify.type === 'user') {
            req.userId = verify.userId
            const user = await userService.getUserByUserId(verify.userId);
            if (user && user.role.roleName === 'admin') {
                next();
            }
            else {
                return res.status(401).send('Access denied. You are not an admin');
            }
        }
        else { return res.status(401).send('Access denied. No token provided'); };
    }
    catch (ex) {
        res.status(400).send('Access denied. Invalid token');
    }
}
