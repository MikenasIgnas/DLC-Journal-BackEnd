import {
  Request,
  Response,
}                        from 'express'
import {
  SortOrder,
  Types,
}                        from 'mongoose'

import { getPagination } from '../../helpers.js'
import { iSstring }      from '../../typeChecks.js'
import VisitSchema       from '../../shemas/VisitSchema.js'

interface Params {
  companyId?:          Types.ObjectId
  date?:               Date
  descending?:         boolean
  endDate?:            Date
  scheduledVisitTime?: Date
  startDate?:          Date
  statusId?:           Types.ObjectId
}


export default async (req: Request, res: Response) => {
  try {
    const {
      companyId,
      date,
      descending,
      id,
      limit,
      page,
      scheduledVisitTime,
      startDate,
      statusId,
    } = req.query

    if (id) {
      const visit = await VisitSchema.findById({ _id: id })

      return res.status(200).json(visit)
    } else {
      const { parsedLimit, skip } = getPagination(page, limit)

      const params: Params = {}

      if (companyId && iSstring(companyId)) {
        params.companyId = new Types.ObjectId(companyId)
      }

      if (date && iSstring(date)) {
        params.date = new Date(date)
      }

      if (scheduledVisitTime && iSstring(scheduledVisitTime)) {
        params.scheduledVisitTime = new Date(scheduledVisitTime)
      }

      if (startDate && iSstring(startDate)) {
        params.startDate = new Date(startDate)
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
