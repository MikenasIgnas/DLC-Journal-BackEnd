const mongoose = require("mongoose")
const Schema = mongoose.Schema

const CounterSchema = new Schema({
    id: {
        type:String,
    },

    seq: {
        type:Number
    }

})

const exportCounterSchema = mongoose.model("CounterSchema", CounterSchema)

module.exports = exportCounterSchema