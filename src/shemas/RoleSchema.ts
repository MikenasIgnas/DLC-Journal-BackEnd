import { Schema, model } from 'mongoose'

const Role = new Schema({
    created:    { type: Date, default: Date.now },
    name:       { type: String, required: true },
    end:        Date,
    isDisabled: { type: Boolean, required: true },
})

export default model("Role", Role)
