import {
  Schema,
  Types,
  model,
} from 'mongoose'

const Premise = new Schema({
  name:   { type: String, required: true },
  siteId: { type: Types.ObjectId, required: true },
})

export default model('Premise', Premise)
