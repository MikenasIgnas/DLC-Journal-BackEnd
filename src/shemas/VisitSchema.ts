import {
  Schema,
  Types,
  model,
} from 'mongoose'

const Visit = new Schema({
  companyId:          { type: Types.ObjectId, required: true },
  date:               { type: Date, default: Date.now },
  dlcEmlpyee:         { type: Types.ObjectId },
  guests:             [{ type: { name: String, company: String } }],
  carPlates:          [{ type: String }],
  scheduledVisitTime: { type: Date },
  startDate:          { type: Date },
  endDate:            { type: Date },
  statusId:           { type: Types.ObjectId },
  racks:              [{ type: Types.ObjectId }],
  permissions:        [{ type: Types.ObjectId }],
  siteId:             { type: Types.ObjectId },
  visitPurpose:       [{ type: Types.ObjectId }],
})

export default model('Visit', Visit)