const mongoose = require("mongoose")
const Schema = mongoose.Schema

const TodoSchema = new Schema({
    id: {
        type:Number,
        required: true
    },
    areasId: {
        type:Number,
        required: true
    },
    duty: {
        type:String,
        required: true
    },
})

const exportTodo = mongoose.model("TodoTable", TodoSchema)

module.exports = exportTodo