const mongoose = require("mongoose")
const Schema = mongoose.Schema

const AreasSchema = new Schema({
    id: {
        type:Number,
        required: true
    },
    routesId: {
        type:Number,
        required: true
    },
    areaNumber: {
        type:String,
        required: true
    },
    roomName: {
        type:String,
        required: true
    },
})

const exportAreas = mongoose.model("AreasTable", AreasSchema)

module.exports = exportAreas