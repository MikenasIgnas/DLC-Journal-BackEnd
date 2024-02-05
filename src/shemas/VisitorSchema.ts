import {
  Schema,
  Types,
  model,
} from 'mongoose'

const Visitor = new Schema({
  dlcEmployee: { type: Types.ObjectId, required: true },
  employeeId:  { type: Types.ObjectId, required: true },
  visitId:     { type: Types.ObjectId, required: true },
})

export default model('Visitor', Visitor)