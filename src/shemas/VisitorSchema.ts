import {
  Schema,
  Types,
  model,
} from 'mongoose'

const Visitor = new Schema({
  visitorIdType: { type: Types.ObjectId },
  signature:     { type: String },
  employeeId:    { type: Types.ObjectId, required: true },
  visitId:       { type: Types.ObjectId, required: true },
})

export default model('Visitor', Visitor)