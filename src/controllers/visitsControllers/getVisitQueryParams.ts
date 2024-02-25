import { Types }             from 'mongoose'

import { iSstring }          from '../../typeChecks'
import { RequestQuery }      from '../../types'
import CompanyEmployeeSchema from '../../shemas/CompanyEmployeeSchema'
import CompanySchema         from '../../shemas/CompanySchema'
import getSearchFilters      from '../../utility/getSearchFilters'
import RackSchema            from '../../shemas/RackSchema'
import UserSchema            from '../../shemas/UserSchema'
import VisitorSchema         from '../../shemas/VisitorSchema'
import VisitPurposeSchema    from '../../shemas/VisitPurposeSchema'

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
    { _id: { $in: Types.ObjectId[] } },
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
  search?:    RequestQuery
  siteId?:    RequestQuery
  statusId?:  RequestQuery
  startFrom?: RequestQuery
  startTo?:   RequestQuery
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

    const companyEmployeesParams = getSearchFilters({
      name:       search,
      email:      search,
      lastname:   search,
      occupation: search,
      phone:      search,
    })

    const companyEmployess = await CompanyEmployeeSchema.find(companyEmployeesParams)

    const companyEmployeesIds = companyEmployess.map(({ _id }) => _id)

    const visitors = await VisitorSchema.find({ employeeId: { $in: companyEmployeesIds }})

    const visitIds: Types.ObjectId[] = []

    for (let index = 0; index < visitors.length; index++) {
      const visitId = visitors[index].visitId as Types.ObjectId

      if (!visitIds.includes(visitId)) {
        visitIds.push(visitId)
      }
    }

    params.$or = [
      { companyId: { $in: companyIds } },
      { dlcEmployee: { $in: dlcEmployeeIds } },
      { _id: { $in: visitIds } },
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

  if (siteId && iSstring(siteId)) {
    params.siteId = new Types.ObjectId(siteId)
  }

  if (startFrom && iSstring(startFrom) && startTo && iSstring(startTo)) {
    params.startDate = { $lt: new Date(startTo), $gt: new Date(startFrom) }
  }

  if (statusId && iSstring(statusId)) {
    params.statusId = new Types.ObjectId(statusId)
  }

  return params
}