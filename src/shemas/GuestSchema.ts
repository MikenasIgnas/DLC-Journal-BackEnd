import {
  Schema,
  Types,
  model,
} from 'mongoose'

const Guests = new Schema({
  company:     { type: String, required: true },
  guestIdType: { type: Types.ObjectId },
  name:        { type: String, required: true },
  signed:      { type: Boolean, required: true, default: false },
  visitId:     { type: Types.ObjectId, required: true },
})

export default model('Guests', Guests)