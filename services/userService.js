const { User, validate } = require('../models/user');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Logger = require('./loggerService');

async function createUser(user) {
    try {
        // const { error } = validate(req.body);
        // if (error) return res.status(400).send(error.details[0].message);

        let salt = await bcrypt.genSalt(10);
        user.userPassword = await bcrypt.hash(user.userPassword, salt);
        const confirmcode = await bcrypt.hash(`${user.userEmail}${user.userPassword}`, salt);
        user.confirmCode = await bcrypt.hash(confirmcode, salt);
        Logger.info(`creating new user ${JSON.stringify(user)}`)
        return await User.create(user);
    }
    catch (e) {
        Logger.error(`Error occured while creating user. Error details - ${e}`)
        return null;
    }
}


async function getUserByUserId(userId) {
    try {
        return await User.findOne({ userId: userId });
    }
    catch (e) {
        Logger.error(`Error occured while getting user with user id - ${userId} in getUserByUserId. Error details - ${e}`)
        return null;
    }
}

async function getUserByEmail(email) {
    try {
        return await User.findOne({ userEmail: email });
    }
    catch (e) {
        Logger.error(`Error occured while getting user with user email - ${email} in getUserByEmail. Error details - ${e}`)
        return null;
    }
}

async function getUserByVerificationCode(sCode) {
    try {
        return await User.findOne({ confirmCode: sCode });
    }
    catch (e) {
        Logger.error(`Error occured while getting user with user confirmation code - ${sCode} in getUserByVerificationCode. Error details - ${e}`)
        return null;
    }
}

async function updateUser(user) {
    try {
        if (user._id) {
            const filter = { _id: user._id };
            const update = { ...user };

            return User.findOneAndUpdate(filter, update, {
                new: true
            })
        }
        else {
            throw new Error('user _id is not defined');
        }
    }
    catch (e) {
        Logger.error(`Error occured while updating user  - ${JSON.stringify(user)}. Error details - ${e}`)
    }
}

async function deleteUser(user) {
    try {
        if (user._id) {
            const filter = { _id: user._id };
            return User.findOneAndDelete(filter)
        }
        else {
            throw new Error('user _id is not defined');
        }
    }
    catch (e) {
        Logger.error(`Error occured while deleting user  - ${JSON.stringify(user)}. Error details - ${e}`)
    }
}

function generateAuthToken(user) {
    return jwt.sign({ userId: user.userId, userEmail: user.userEmail, type: 'user' }, process.env.jwtKey, { expiresIn: '2d' });
}
function verifyToken(token) {
    try {
        const verify = jwt.verify(token, process.env.jwtKey);
        if (verify.type === 'user') { return verify; }
        else { return null };
    } catch (error) {
        Logger.error(`Error occured while verifying token ${token} . in verifyToken. Error details - ${e}`)
        return null;
    }
}

function encryptCode(code,pwd) {
    code = `${Date.now()}~${code}`;
    if (pwd) {
        code = `${code}~pwd`;
    }
    return Buffer.from(code).toString('base64');
}
function decryptCode(code) {
    return Buffer.from(code, 'base64').toString('ascii');
}

module.exports = {
    createUser,
    generateAuthToken,
    getUserByEmail,
    getUserByUserId,
    getUserByVerificationCode,
    updateUser,
    deleteUser,
    verifyToken,
    encryptCode,
    decryptCode
}