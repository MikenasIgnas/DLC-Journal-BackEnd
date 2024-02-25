import {
  Schema,
  Types,
  model,
} from 'mongoose'

const Visitor = new Schema({
  visitorIdType: { type: Types.ObjectId },
  employeeId:    { type: Types.ObjectId, required: true },
  signed:        { type: Boolean, required: true, default: false },
  visitId:       { type: Types.ObjectId, required: true },
})

export default model('Visitor', Visitor)