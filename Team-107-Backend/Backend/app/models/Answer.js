const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    surveyId: {
        type: Number,
        required: true,
        ref: 'Survey'
    },
    //store answers as json object
    answers: Object,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer;