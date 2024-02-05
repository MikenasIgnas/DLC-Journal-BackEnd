import {
  Schema,
  model,
} from 'mongoose'

const VisitorIdType = new Schema({
  name: { type: String, required: true },
})

export default model('VisitorIdType', VisitorIdType)