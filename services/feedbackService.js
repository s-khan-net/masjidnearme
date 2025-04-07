
const { Feedback } = require('../models/feedback');
const Logger = require('./loggerService');

async function saveFeedBack(email, type, feedback) {
    try {
        if (!email || !type || !feedback) {
            Logger.error(`Invalid parameters passed to saveFeedBack`)
            return null;
        }
        Logger.info(`adding new feedback for ${JSON.stringify(email)}`)
        let feedbackObj = {
            userId: email,
            feedbackType: type,
            feedbackContent: feedback
        }
        return await Feedback.create(feedbackObj);
    }
    catch (e) {
        Logger.error(`Error occured while adding feedback. Error details - ${e}`)
        return null;
    }
}

async function getFeedbackByUser(email) {
    try {
        return await Feedback.find({ userId: email }, 'feedbackType feedbackContent -_id');
    }
    catch (e) {
        Logger.error(`Error occured while getting feedback with user  - ${email} in getFeedbackByUserId. Error details - ${e}`)
        return null;
    }
}

async function getTopFeedbacks(limit) {
    try {
        return await Feedback.find().limit(limit).sort({ createdAt: -1 });
    }
    catch (e) {
        Logger.error(`Error occured while getting feedback in getTopFeedbacks. Error details - ${e}`)
        return null;
    }
}

module.exports = {
    saveFeedBack,
    getFeedbackByUser,
    getTopFeedbacks
};