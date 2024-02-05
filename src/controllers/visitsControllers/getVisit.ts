import {
  Request,
  Response,
}                        from 'express'
import { ObjectId }      from 'mongoose'

import { getPagination } from '../../helpers.js'
import VisitSchema       from '../../shemas/VisitSchema.js'

interface Params {
  carPlates?:          string
  companyId?:          number
  date?:               Date
  endDate?:            Date
  guests?:             string
  scheduledVisitTime?: Date
  startDate?:          Date
  statusId?:           ObjectId
}


export default async (req: Request, res: Response) => {
  try {
    const {
      carPlates,
      companyId,
      date,
      endDate,
      guests,
      id,
      page,
      limit,
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

      if (carPlates) {
        params.carPlates
      }

      if (companyId) {
        params.companyId
      }

      if (date) {
        params.date
      }

      if (date) {
        params.date
      }

      if (endDate) {
        params.endDate
      }

      if (guests) {
        params.guests
      }

      if (scheduledVisitTime) {
        params.scheduledVisitTime
      }

      if (startDate) {
        params.startDate
      }

      if (statusId) {
        params.statusId
      }

      const visits = await VisitSchema.find(params).limit(parsedLimit).skip(skip)

      return res.status(200).json(visits)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
