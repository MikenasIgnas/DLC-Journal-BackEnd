import {
  Schema,
  model,
  Types,
} from 'mongoose'

const CompanyDocument = new Schema({
  companyId: { type: Types.ObjectId, required: true },
  path:      { type: String, required: true },
  name:      { type: String, required: true },
  format:    { type: String, required: true },
})

export default model('CompanyDocument', CompanyDocument)
