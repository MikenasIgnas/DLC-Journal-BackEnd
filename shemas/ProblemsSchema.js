const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ProblemsSchema = new Schema({
    id: {
        type:Number,
        required: true
    },
    todoId: {
        type:Number,
        required: true
    },
    possibleProblem: {
        type:String,
        required: true
    },
    reaction: {
        type:String,
        required: true
    },
})

const exportProblems = mongoose.model("ProblemsTable", ProblemsSchema)

module.exports = exportProblems