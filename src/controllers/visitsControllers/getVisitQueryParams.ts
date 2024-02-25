import { Types }          from 'mongoose'

import CompanySchema      from '../../shemas/CompanySchema'
import RackSchema         from '../../shemas/RackSchema'
import VisitPurposeSchema from '../../shemas/VisitPurposeSchema'
import UserSchema         from '../../shemas/UserSchema'

interface Includes {
  $in: Types.ObjectId[]
}

interface QueryParams {
  companyId?:    Includes
  descending?:   boolean
  dlcEmployee?:  Includes
  endDate?:      Date
  racks?:        Includes
  siteId?:       Types.ObjectId
  startDate?:    { $lt: Date, $gt: Date }
  statusId?:     Types.ObjectId
  visitPurpose?: Includes
  $or?: [
    { companyId: { $in: Types.ObjectId[] } },
    { dlcEmployee: { $in: Types.ObjectId[] } },
    { racks: { $in: Types.ObjectId[] } },
    { visitPurpose: { $in: Types.ObjectId[] } },
    { carPlates: { $regex: string, $options: 'i' } },
    { guests: {
      $elemMatch: {
        $or: [
          { name: { $regex: string, $options: 'i' } },
          { company: { $regex: string, $options: 'i' }},
        ],
      },
    }}
  ]
}

interface Params {
  search?:    string
  siteId?:    string
  statusId?:  string
  startFrom?: string
  startTo?:   string
}


export default async ({ search, siteId, startFrom, startTo, statusId }: Params) => {
  const params: QueryParams = {}

  if (search) {
    const companies = await CompanySchema.find({
      $or: [{ name: { $regex: search, $options: 'i' } }],
    })

    const companyIds = companies.map(el => el._id)

    const racks = await RackSchema.find({
      $or: [{ name: { $regex: search, $options: 'i' } }],
    })

    const rackIds = racks.map(el => el._id)

    const visitPurposes = await VisitPurposeSchema.find({
      $or: [{ name: { $regex: search, $options: 'i' } }],
    })

    const visitPuroseIds = visitPurposes.map(el => el._id)

    const dlcEmployees = await UserSchema.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ],
    })

    const dlcEmployeeIds = dlcEmployees.map(el => el._id)

    params.$or = [
      { companyId: { $in: companyIds } },
      { dlcEmployee: { $in: dlcEmployeeIds } },
      { racks: { $in: rackIds } },
      { visitPurpose: { $in: visitPuroseIds } },
      { carPlates: { $regex: String(search), $options: 'i' } },
      { guests: {
        $elemMatch: {
          $or: [
            { name: { $regex: String(search), $options: 'i' } },
            { company: { $regex: String(search), $options: 'i' }},
          ],
        },
      }},
    ]
  }

  if (siteId) {
    params.siteId = new Types.ObjectId(siteId)
  }

  if (startFrom && startTo) {
    params.startDate = { $lt: new Date(startTo), $gt: new Date(startFrom) }
  }

  if (statusId) {
    params.statusId = new Types.ObjectId(statusId)
  }

  return params
}