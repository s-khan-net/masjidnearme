const auth = require("../middleware/auth");
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const userService = require("../services/userService");
const feedbackService = require("../services/feedbackService");
const emailService = require("../services/emailService");
const Logger = require("../services/loggerService");

router.get("/me", auth, async (req, res) => {
    const user = await userService.getUserByUserId(req.body.user.userId)
    if (!user) return res.status(402).send(`{"status": "bad request", "message": "the User with id:${req.body.user.userId} could not be found"}`);
    res.send(user);
});
router.get("/id/:id", auth, async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(402).send(`{"status": "bad request", "message": "the User with id:${req.params.id} could not be found")`);
    res.send(user);
});
router.post("/verify", async (req, res) => {
    Logger.info(`verifying user with verification code ${req.body.verificationCode}`);
    if (!req.body.verificationCode) return res.send(`{"status": "bad request", "message": "The verification code is not defined"}`).status(400);
    const user = await userService.getUserByVerificationCode(req.body.verificationCode);
    if (!user) return res.send(`{"status": "bad request", "message": "The User could not be found"}`).status(400);

    //update user"s verfiedEmail to true
    Logger.info(`user verified, hence updating the verified email status as true`)
    let newUser = _.cloneDeep(user)
    newUser.verifiedEmail = true;
    newUser.userModifiedOn = Date.now();
    newUser.userModifiedBy = process.env.adminEmail

    await userService.updateUser(newUser)

    Logger.info(`sending welcome email to ${user.userEmail}`)
    const emailres = await emailService.sendMail("welcome", user);
    Logger.info(`email sending result ${JSON.stringify(emailres)}`);

    let token = userService.generateAuthToken(newUser);
    res.header("Access-Control-Expose-Headers", "x-auth-token").header('x-auth-token', token).send(`{"status": "OK", "message": "Logged in as ${newUser.userEmail}", "user":${JSON.stringify(newUser)}}`).status(200);
});
router.post("/", async (req, res) => { //regiser
    Logger.info(`registering new user ${JSON.stringify(req.body.user)}`);
    let user = await userService.getUserByEmail(req.body.user.userEmail);
    Logger.info(`user from DB ${JSON.stringify(user)}`);
    if (user) return res.send(`{"status": "ERROR", "message": "User already exists"}`).status(200);

    //validate
    req.body.user.userPassword = atob(req.body.user.userPassword);
    let validation = validateUser(req.body.user)
    Logger.info(`validation result ${JSON.stringify(validation)}`);
    if (validation.valid) {
        user = await userService.createUser(req.body.user)
    }
    else {
        return res.send(`{"status": "ERROR", "message": "${validation.errorMessage}"}`).status(200)
    }

    // let token = user.generateAuthToken();
    // res.header("x-auth-token", token).send(_.pick(user, ["_id", "userId", "userEmail"]));

    //send mail with confirm code
    Logger.info(`sending email to ${user.userEmail}`)
    const emailres = await emailService.sendMail("verify", user);
    Logger.info(`email sending result ${JSON.stringify(emailres)}`);
    res.send(`{"status": "OK", "message": "You have successfully registered with us, please check your email - ${user.userEmail} to verify your email address"}`).status(200);
});
router.put("/", auth, async (req, res) => {
    try {
        let user = await userService.getUserByEmail(req.body.user.userEmail);
        if (!user) return res.status(400).send(`{"updated":false, "message":"user could not be updated, please check error details", "details":"User to updated is not defined by the user object sent."}`)
        let validation = validateUser(req.body.user)
        if (validation.valid) {
            const result = await userService.updateUser(req.body.user)
            res.send(`{"updated":true, "message":"User updated successfully", "details": "User was updated and the details of the User can be checked using v1/users/me"}`).status(200);
        }
        else {
            return res.send(`{"status": "bad request", "message": "${validation.errorMessage}"}`).status(400)
        }
    }
    catch (e) {
        console.log(e);
        res.send(`{"updated":false, "message":"User could not be updated, please check error details", "details":${result}}`).status(400)
    }
})
router.delete("/", auth, async (req, res) => {
    try {
        let user = await userService.getUserByEmail(req.body.user.userEmail);
        if (!user) return res.status(400).send(`{"deleted":false, "message":"user could not be deleted, please check error details", "details":"User to deleted is not defined by the user object sent."}`);
        // await emailService.sendMail("delete", {
        //     userEmail: user.userEmail,
        //     message: `Your account with email ${user.userEmail} has been successfully deleted.`,
        // });
        const feedbackRes = await feedbackService.saveFeedBack(user.userEmail, "delete", req.body.user.reason);
        Logger.info(`deleting user -> ${req.body.user.userEmail}`)
        const result = await userService.deleteUser(user)

        //send mail with delete
        Logger.info(`sending deletion email to ${user.userEmail}`)
        const emailres = await emailService.sendMail("delete", user);
        Logger.info(`email sending result ${JSON.stringify(emailres)}`);
        
        if (result) res.status(200).send(`{"deleted":true, "message":"Your user profile has been deleted successfully"}`);
        else res.status(400).send(`{"deleted":false, "message":"User could not be deleted, please check error details", "details":"Error occured while deleting the user"}`)
    }
    catch (e) {
        console.log(e);
        res.status(400).send(`{"deleted":false, "message":"User could not be deleted, please check error details", "details":${result}}`)
    }
})

function validateUser(user) {
    let res = { valid: true, errorMessage: "" }
    if (!user.userEmail || !user.userPassword || !user.userprofile.firstName || !user.userprofile.lastName) {
        res.valid = false;
        res.errorMessage = "User details are incomplete"
    }
    else {
        res = validatePassword(user.userPassword)
    }
    return res;
}

function validatePassword(p) {
    let errors = [];
    let res = { valid: true, errorMessage: "" }
    if (p.length < 6) {
        errors.push("Your password must be at least 6 characters");
    }
    if (p.search(/[a-z]/i) < 0) {
        errors.push("Your password must contain at least one letter.");
    }
    if (p.search(/[0-9]/) < 0) {
        errors.push("Your password must contain at least one digit.");
    }
    if (errors.length > 0) {
        res.errorMessage = errors.join("\n");
        res.valid = false;
    }
    return res;
}

module.exports = router;