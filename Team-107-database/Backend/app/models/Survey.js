const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
    //store answers as json object
    surveyName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    questions: {
        type: Object,
        required: true
    }
});

const Survey = mongoose.model('Surveys', surveySchema);

module.exports = Survey;