const mongoose = require("mongoose")
const Schema = mongoose.Schema

const VisitsSchema = new Schema({
    _id: {
        type:String,
        required: true
    },
    id: {
        type:String,
        required: true
    },
    visitInfo: {
        visitingClient:{
            type:String,
            required: true
        },
        clientsEmployees:{
            type: String,
            required: true,
        },
        visitAddress: {
            type: String,
            required: true,
        },
        dlcEmployees: {
            type: String,
            required: true
        }

    },
    visitGoal: {
        visitPurpose: {
            type:String,
            required: true
        }
    },
    visitorsId:{
        visitorsIdType: {
            type:String,
            required: true
        },
        signature: {
            type: String,
            required: true
        },
        visitCollocation: {
            type: Array,
            required: true
        }
    },
})

const exportVisits = mongoose.model("Visits", VisitsSchema)

module.exports = exportVisits