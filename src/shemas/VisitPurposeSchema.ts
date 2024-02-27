import {
  Schema,
  model,
} from 'mongoose'

const VisitPurpose = new Schema({
  name: { type: String, required: true },
})

export default model('VisitPurpose', VisitPurpose)