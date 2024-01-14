import {
  Request,
  Response,
}                            from 'express'

import { getPagination }     from '../../helpers.js'
import CompanyEmployeeSchema from '../../shemas/CompanyEmployeeSchema.js'


export default async (req: Request, res: Response) => {
  try {
    const { name, id, page, limit } = req.query

    if (id) {
      const employee = await CompanyEmployeeSchema.findById({ _id: id })

      return res.status(200).json(employee)
    } else {
      const { parsedLimit, skip } = getPagination(page, limit)

      let employees

      if (!name) {
        employees = await CompanyEmployeeSchema.find().limit(parsedLimit).skip(skip)
      } else {
        employees = await CompanyEmployeeSchema.find({ name }).limit(parsedLimit).skip(skip)
      }

      return res.status(200).json(employees)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
