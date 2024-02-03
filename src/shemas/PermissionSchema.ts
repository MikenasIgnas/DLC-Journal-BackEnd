import {
  Schema,
  model,
} from 'mongoose'

const Permission = new Schema({
  name: { type: String, required: true },
})

export default model('Permission', Permission)