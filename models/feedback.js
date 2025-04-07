const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    feedbackType: { type: String, required: true },
    feedbackContent: { type: String, required: true },
    createdOn: { type: Date, default: Date.now },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

exports.Feedback = Feedback;