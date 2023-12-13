const mongoose = require("mongoose")
const { stringify } = require("uuid")
const Schema = mongoose.Schema

const VisitsSchema = new Schema({
    _id: { type:String, required: true },
  visitStatus: String,
  visitingClient:{ type:String, required: true },
  clientsEmployees:{ type: String, required: true, },
  visitAddress: { type: String, required: true,},
  dlcEmployees: { type: String, required: true},
  visitPurpose: [{ type: String, required: true }],
  visitorsIdType: String,
  visitCollocation: { type: Array,required: true },
  signature: { type: String, required: true },
  creationDate: String,
  creationTime: String,
  id: { type:Number, required: true },
  endDate: String,
  endTime: String,
  startDate: String,
  startTime: String,
})

const exportVisits = mongoose.model("Visits", VisitsSchema)

module.exports = exportVisits