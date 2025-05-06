const auth = require("../middleware/auth");
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const feedbackService = require("../services/feedbackService");
const emailService = require("../services/emailService");
const Logger = require("../services/loggerService");

router.get("/:email?", auth, async (req, res) => {
    if (req.params.email) {
        const feedback = await feedbackService.getFeedbackByUser(req.params['email']);
        if (!feedback) return res.status(402).send(`{"status": "bad request", "message": "the Feedback with id:${req.params.email} could not be found"}`);
        let temp = _.pick(feedback, 'feedbackContent', 'feedbackType');
        res.status(200).send(feedback);
    }
    else {
        //get top 10 feedbacks
        const feedback = await feedbackService.getTopFeedbacks(10);
        if (!feedback) return res.status(402).send(`{"status": "bad request", "message": "the Feedback could not be found"}`);
        res.status(200).send(`{"status": "OK", feedback:${JSON.stringify(feedback)}}`);
    }
})

router.post("/", auth, async (req, res) => {
    Logger.info(`adding feedback ${JSON.stringify(req.body.feedback)}`);
    let feedback = await feedbackService.saveFeedBack(req.body.user.userEmail, req.body.user.feedbackType, req.body.user.feedbackContent);
    if (!feedback) return res.status(402).send(`{"status": "bad request", "message": "the Feedback with id:${req.body.user.userId} could not be saved"}`);
    if (req.body.user.feedbackContent == 'permission') {
        res.status(200).send(`{"status": "OK", "message": "Permission request sent."}`);
    }
    else {
        res.status(200).send(`{"status": "OK", "message": "Your Feedback has been sent. Thank you."}`);
    }

})

module.exports = router;