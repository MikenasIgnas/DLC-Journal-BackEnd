import {
  Request,
  Response,
}                        from 'express'
// import { ObjectId }      from 'mongoose'

import { getPagination } from '../../helpers.js'
import { isNonExistant } from '../../typeChecks.js'
import VisitorSchema     from '../../shemas/VisitorSchema.js'

interface Params {
  dlcEmployee?: string
  employeeId?:  string
  visitId?:     string
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

      if (!isNonExistant(dlcEmployee)) {
        params.dlcEmployee = dlcEmployee as string
      }

      if (!isNonExistant(employeeId)) {
        params.employeeId = employeeId as string
      }

      if (!isNonExistant(visitId)) {
        params.visitId = visitId as string
      }

      const visitors = await VisitorSchema.find(params).limit(parsedLimit).skip(skip)

      return res.status(200).json(visitors)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
