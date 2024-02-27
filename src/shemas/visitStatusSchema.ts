import {
  Schema,
  model,
} from 'mongoose'

const VisitStatus = new Schema({
  name: { type: String, required: true },
})

export default model('VisitStatus', VisitStatus)
