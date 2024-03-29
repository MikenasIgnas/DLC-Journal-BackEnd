import {
  Schema,
  model,
  Types,
} from 'mongoose'

const Company = new Schema({
  companyCode: { type: Number, required: false },
  description: { type: String, required: false },
  isDisabled:  { type: Boolean, required: false },
  name:        { type: String, required: true },
  parentId:    { type: Types.ObjectId, required: false },
  photo:       { type: String },
  racks:       [{ type: Types.ObjectId, required: true }],
})

export default model('Company', Company)