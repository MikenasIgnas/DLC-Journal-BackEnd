import {
  Schema,
  Types,
  model,
} from 'mongoose'

const Visit = new Schema({
  carPlates:          [{ type: String }],
  companyId:          { type: Types.ObjectId, required: true },
  date:               { type: Date, default: Date.now },
  dlcEmlpyee:         { type: Types.ObjectId },
  endDate:            { type: Date },
  guests:             [{ type: { name: String, company: String } }],
  id:                 { type: Number, required: true },
  permissions:        [{ type: Types.ObjectId }],
  racks:              [{ type: Types.ObjectId }],
  scheduledVisitTime: { type: Date },
  siteId:             { type: Types.ObjectId },
  startDate:          { type: Date },
  statusId:           { type: Types.ObjectId },
  visitPurpose:       [{ type: Types.ObjectId }],
})

export default model('Visit', Visit)