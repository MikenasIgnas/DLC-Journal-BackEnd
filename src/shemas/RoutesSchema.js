const mongoose = require("mongoose")
const Schema = mongoose.Schema

const RoutesSchema = new Schema({
    id: {
        type:Number,
        required: true
    },
    routeNumber: {
        type:Number,
        required: true
    },
    floor: {
        type:String,
        required: true
    },
})

const exportRoutes = mongoose.model("RoutesTable", RoutesSchema)

module.exports = exportRoutes