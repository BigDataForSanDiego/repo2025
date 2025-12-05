const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
    surveyId: {
        type: mongoose.Schema.Types.ObjectId,
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

const Response = mongoose.model('Response', responseSchema);