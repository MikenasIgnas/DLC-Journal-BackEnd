import {
  Schema,
  model,
  Types,
} from 'mongoose'

const Company = new Schema({
  description: { type: String, required: false },
  isDisabled:  { type: Boolean, required: false },
  photo:       { type: String },
  name:        { type: String, required: true },
  parentId:    { type: Types.ObjectId, required: false },
  racks:       [{ type: Types.ObjectId, required: true }],
  document:    [{type: String, required: false}],
})

export default model('Company', Company)