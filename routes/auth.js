const express = require('express');
const Joi = require('joi');
const router = express.Router();
const _ = require('lodash');
const { User } = require('../models/user');
const bcrypt = require('bcrypt');
const userService = require('../services/userService');
const emailService = require('../services/emailService');
const Logger = require('../services/loggerService');

//this is the login method
router.post('/', async (req, res) => {
    try {
        Logger.info(`logging in user ${JSON.stringify(req.body.user)}`);
        const user = await User.findOne({ userEmail: req.body.user.userEmail });
        if (!user) return res.status(400).send(`{"status": "ERROR", "message": "The user with this email is not present with us. Please validate the entered details."}`);

        const valid = await bcrypt.compare(req.body.user.userPassword, user.userPassword);
        Logger.info(`user from DB -> ${JSON.stringify(user)} and valid result -> ${valid}`);
        if (!valid) return res.status(400).send(`{"status": "ERROR", "message": "The user email and/or Password do not match. Please validate the entered details."}`);

        if (!user.verifiedEmail) return res.status(400).send(`{"status": "ERROR", "message": "You have not verified your email. A verificaton email has been sent to ${user.userEmail}. Please use the link sent in the email, to verify yourself", "verificationCode":"${user.confirmCode}","userEmail":"${user.userEmail}"}`);

        let token = userService.generateAuthToken(user);
        let encryptedUser = btoa(JSON.stringify(user));
        res.status(200).header("Access-Control-Expose-Headers", "x-auth-token").header('x-auth-token', token).send(`{"status": "OK", "message": "Logged in as ${user.userEmail}", "user":${JSON.stringify(user)}}`);
    }
    catch (e) {
        Logger.error(e)
        return res.status(400).send(`{"status": "ERROR", "message": "<b>A fatal error<b> occured while signing you in, please try after some time."}`);
    }

});
//verify token
router.post('/verify', async (req, res) => {
    try {
        let token = req.body.token;
        let verify = userService.verifyToken(token);
        if (verify && verify.userId) {
            const user = await userService.getUserByUserId(verify.userId)
            if (user) {
                return res.status(200).send(`{"status": "OK", "message": "The token was successfully verified.", "user":${JSON.stringify(user)}}`);
            }
            else {
                return res.status(400).send(`{"status": "ERROR", "message": "Could not validate the token"}`);
            }
        }
        else {
            return res.status(400).send(`{"status": "ERROR", "message": "Could not validate the token"}`);
        }
    } catch (e) {
        Logger.error(e)
        return res.status(400).send(`{"status": "ERROR", "message": "Could not validate the token"}`);
    }
});
router.post('/send', async (req, res) => {
    try {
        if (req.body.confirmCode && req.body.userEmail) {
            const user = await userService.getUserByEmail(req.body.userEmail)
            const emailSent = await emailService.sendMail('verify', user);
            if (emailSent)
                return res.status(200).send(`{"status": "OK", "message": "The verification email was successfully sent."}`);
            else
                return res.status(400).send(`{"status": "ERROR", "message": "Could not send verification email"}`);
        }
    } catch (e) {
        Logger.error(e)
        return res.status(400).send(`{"status": "ERROR", "message": "Could not send verification email"}`);
    }
})

//helper function for b2a
const btoa = function (str) { return Buffer.from(str).toString('base64'); }

module.exports = router;