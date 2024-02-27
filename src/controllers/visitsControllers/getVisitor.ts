import {
  Request,
  Response,
}                        from 'express'
import { Types }         from 'mongoose'

import { getPagination } from '../../helpers.js'
import {
  iSstring,
  isNonExistant,
}                        from '../../typeChecks.js'
import VisitorSchema     from '../../shemas/VisitorSchema.js'

interface Params {
  dlcEmployee?: Types.ObjectId
  employeeId?:  Types.ObjectId
  visitId?:     Types.ObjectId
}

export default async (req: Request, res: Response) => {
  try {
    const { dlcEmployee, employeeId, id, page, limit, visitId } = req.query

    if (id) {
      const visitor = await VisitorSchema.findById({ _id: id })

      return res.status(200).json(visitor)
    } else {
      const { parsedLimit, skip } = getPagination(page, limit)

      const params: Params = {}

      if (!isNonExistant(dlcEmployee) && iSstring(dlcEmployee)) {
        params.dlcEmployee = new Types.ObjectId(dlcEmployee)
      }

      if (!isNonExistant(employeeId) && iSstring(employeeId)) {
        params.employeeId = new Types.ObjectId(employeeId)
      }

      if (!isNonExistant(visitId) && iSstring(visitId)) {
        params.visitId = new Types.ObjectId(visitId)
      }

      const visitors = await VisitorSchema.find(params).limit(parsedLimit).skip(skip)

      return res.status(200).json(visitors)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
