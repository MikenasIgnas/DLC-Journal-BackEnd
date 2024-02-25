import {
  Request,
  Response,
}                         from 'express'
import {
  SortOrder,
  Types,
}                         from 'mongoose'

import { getPagination }  from '../../helpers.js'
import { iSstring }       from '../../typeChecks.js'
import CompanySchema      from '../../shemas/CompanySchema.js'
import RackSchema         from '../../shemas/RackSchema.js'
import UserSchema         from '../../shemas/UserSchema.js'
import VisitPurposeSchema from '../../shemas/VisitPurposeSchema.js'
import VisitSchema        from '../../shemas/VisitSchema.js'


interface Includes {
  $in: Types.ObjectId[]
}

interface Params {
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


export default async (req: Request, res: Response) => {
  try {
    const {
      descending,
      id,
      limit,
      page,
      search,
      siteId,
      startFrom,
      startTo,
      statusId,
    } = req.query

    if (id) {
      const visit = await VisitSchema.findById({ _id: id })

      return res.status(200).json(visit)
    } else {
      const { parsedLimit, skip } = getPagination(page, limit)

      const params: Params = {}

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

      if (siteId && iSstring(siteId)) {
        params.siteId = new Types.ObjectId(siteId)
      }

      if (startFrom && iSstring(startFrom) && startTo && iSstring(startTo)) {
        params.startDate = { $lt: new Date(startTo), $gt: new Date(startFrom) }
      }

      if (statusId && iSstring(statusId)) {
        params.statusId = new Types.ObjectId(statusId)
      }

      let sort: SortOrder = 1

      if (descending === 'true') {
        sort = -1
      }

      const visits = await VisitSchema.find(params)
        .limit(parsedLimit).skip(skip).sort({ date: sort })

      return res.status(200).json(visits)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
