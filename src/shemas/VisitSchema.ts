import {
  Schema,
  Types,
  model,
} from 'mongoose'

const Visit = new Schema({
  carPlates:          [{ type: String }],
  companyId:          { type: Types.ObjectId, required: true },
  date:               { type: Date, default: Date.now },
  dlcEmployee:        { type: Types.ObjectId },
  documentPath:       { type: String },
  endDate:            { type: Date },
  id:                 { type: Number, required: true },
  racks:              [{ type: Types.ObjectId }],
  scheduledVisitTime: { type: Date },
  siteId:             { type: Types.ObjectId },
  startDate:          { type: Date },
  statusId:           { type: Types.ObjectId },
  visitPurpose:       [{ type: Types.ObjectId }],
})

export default model('Visit', Visit)