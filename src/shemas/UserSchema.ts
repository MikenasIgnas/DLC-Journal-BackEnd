import { Schema, model } from 'mongoose'

const User = new Schema({
  created:      { type: Date, default: Date.now },
  disabledDate: Date,
  email:        { type: String, required: true },
  isAdmin:      { type: Boolean, required: true },
  isDisabled:   { type: Boolean, required: true },
  isSecurity:   { type: Boolean, required: true },
  name:         { type: String, required: true },
  password:     { type: String, required: true },
  username:     { type: String, required: true },
})

export default model('User', User)