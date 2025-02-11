const auth = require("../middleware/auth");
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const userService = require("../services/userService");
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
    const user = await userService.getUserByVerificationCode(req.body.verificationCode);
    if (!user) return res.status(402).send(`{"status": "bad request", "message": "The User could not be found"}`);

    //update user"s verfiedEmail to true
    Logger.info(`user verified, hence updating the verified email status as true`)
    let newUser = _.cloneDeep(user)
    newUser.verifiedEmail = true;
    newUser.userModifiedOn = Date.now();
    newUser.userModifiedBy = process.env.adminEmail

    await userService.updateUser(newUser)

    let token = userService.generateAuthToken(newUser);
    let encryptedUser = btoa(JSON.stringify(newUser));
    res.status(200).header("Access-Control-Expose-Headers", "x-auth-token").header('x-auth-token', token).send(`{"status": "OK", "message": "Logged in as ${newUser.userEmail}", "user":${JSON.stringify(newUser)}}`);
});
router.post("/", async (req, res) => { //regiser
    let user = await userService.getUserByEmail(req.body.user.userEmail);
    if (user) return res.status(400).send(`{"status": "bad request", "message": "User already exists"}`);

    //validate
    let validation = validateUser(req.body.user)
    if (validation.valid) {
        user = await userService.createUser(req.body.user)
    }
    else {
        return res.status(400).send(`{"status": "bad request", "message": "${validation.errorMessage}"}`)
    }

    // let token = user.generateAuthToken();
    // res.header("x-auth-token", token).send(_.pick(user, ["_id", "userId", "userEmail"]));

    //send mail with confirm code
    await emailService.sendMail("verify", user);
    res.status(200).json(`{"status": "OK", "message": "You have successfully registered with us, please check your email - ${user.userEmail} to verify your email address"}`);
});
router.put("/", auth, async (req, res) => {
    try {
        user = req.body.user;
        if (!user._id)
            res.status(400).json(`{"updated":false, "message":"user could not be updated, please check error details", "details":"User to updated is not defined by the user object sent."}`)
        const result = await userService.updateUser(user);
        res.status(200).json(`{"updated":true, "message":"User updated successfully", "details": "User was updated and the details of the User can be checked using v1/users/me"}`);
    }
    catch (e) {
        console.log(e);
        res.status(400).json(`{"updated":false, "message":"User could not be updated, please check error details", "details":${result}}`)
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