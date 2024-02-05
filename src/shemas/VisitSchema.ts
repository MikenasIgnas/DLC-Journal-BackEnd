import {
  Schema,
  Types,
  model,
} from 'mongoose'

const Visit = new Schema({
  companyId:          { type: Types.ObjectId, required: true },
  signature:          { type: String },
  date:               { type: Date, default: Date.now },
  guests:             [{ type: String }],
  carPlates:          [{ type: String }],
  scheduledVisitTime: { type: Date },
  startDate:          { type: Date },
  endDate:            { type: Date },
  statusId:           { type: Types.ObjectId },
  racks:              [{ type: Types.ObjectId }],
  permissions:        [{ type: Types.ObjectId }],
  visitorIdType:      { type: Types.ObjectId },
})

export default model('Visit', Visit)