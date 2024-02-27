import {
  Schema,
  model,
} from 'mongoose'

const Site = new Schema({
  name:     { type: String, required: true },
  isRemote: { type: Boolean, required: true },
})

export default model('Site', Site)