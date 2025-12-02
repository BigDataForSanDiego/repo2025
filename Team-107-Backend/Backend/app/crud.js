const Answer = require("./models/Answer")

// helper methods for accessing database
function store_answer(req){
    const { surveyId } = req.params;
    const body = req.body;
    const answers = body["answer"];
    const newAnswer = new Answer({surveyId, answers});
    const savedAnswer =  newAnswer.save();
    return savedAnswer;
}

module.exports = store_answer;