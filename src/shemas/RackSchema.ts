import {
  Schema,
  Types,
  model,
} from 'mongoose'

const Rack = new Schema({
  name:      { type: String, required: true },
  premiseId: { type: Types.ObjectId, required: true },
})

export default model('Rack', Rack)