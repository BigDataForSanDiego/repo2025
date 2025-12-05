const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    clientId:{
        type: String,
        required: true,
    },
    surveyId: {
        type: Number,
        required: true,
    },
    //store answers as json object
    answers: {
        type: Object,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Answer = mongoose.model('Responses', answerSchema);

module.exports = Answer;