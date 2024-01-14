import {
  Schema,
  model,
  Types,
} from 'mongoose'

const Company = new Schema({
  description: { type: String, required: true },
  isDisabled:  { type: Boolean, required: false },
  photo:       { type: String },
  name:        { type: String, required: true },
  racks:       [{ type: Types.ObjectId, required: true }],
})

export default model('Company', Company)