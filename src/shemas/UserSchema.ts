import { Schema, model } from 'mongoose'

const User = new Schema({
    created:    { type: Date, default: Date.now },
    email:      { type: String, required: true },
    deleted:     Date,
    isDisabled: { type: Boolean, required: true },
    name:       { type: String, required: true },
    password:   { type: String, required: true },
    roleId:     { type: String, required: true },
})

export default model("User", User)