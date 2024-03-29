import {
  Schema,
  model,
  Types,
} from 'mongoose'

const CompanyEmployee = new Schema({
  name:        { type: String, required: true },
  birthday:    { type: Date, required: true },
  isDisabled:  { type: Boolean, required: false },
  lastname:    { type: String, required: true },
  occupation:  { type: String, required: true },
  phone:       { type: String, required: true },
  email:       { type: String, required: true },
  companyId:   { type: Types.ObjectId, required: true },
  photo:       { type: String, required: false },
  permissions: [{ type: Types.ObjectId, required: true }],
  note:        { type: String, required: false },
})

export default model('CompanyEmployee', CompanyEmployee)