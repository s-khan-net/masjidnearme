const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
require('dotenv').config();

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userEmail: { type: String, required: true },
    userPassword: { type: String, required: true },
    userPhone: { type: String, default: '' },
    verifiedEmail: { type: Boolean, default: false },
    verifiedPhone: { type: Boolean, default: false },
    userprofile: {
        firstName: { type: String, default: '' },
        lastName: { type: String, default: '' },
        userPic: { type: String, default: '' },
    },
    role: {
        roleName: { type: String, default: 'default' },
        roleDescription: { type: String, default: 'default' },
    },
    userCreatedOn: { type: Date, default: Date.now() },
    userModifiedOn: { type: Date, default: Date.now() },
    userModifiedBy: { type: String, default: '' },
    googleUser: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
    lastIP: { type: String, default: '' },
    settings: {
        radius: { type: Number, default: 2000 },
        calcMethod: { type: Number, default: 4 },
        school: { type: Number, default: 1 },
        lastLocation: []
    },
    rememberme: { type: Boolean, default: false },
    confirmCode: { type: String, default: '' },
});

userSchema.methods.generateAuthToken = function () {
    return jwt.sign({ userId: this.userId, userEmail: this.userEmail }, process.env.jwtKey);
}
// function validateUser(user) {
//     console.log(user);
//     const schema = {
//         userId: Joi.string().required(),
//         userEmail: Joi.string().min(5).email().required(),
//         userPassword: Joi.string().min(5).required(),
//     };
//     return Joi.validate(user, schema);
// }

const User = mongoose.model('User', userSchema);

exports.User = User;
// exports.validate = validateUser;