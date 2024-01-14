import {
  Request,
  Response,
}                            from 'express'

import { getPagination }     from '../../helpers.js'
import CompanyEmployeeSchema from '../../shemas/CompanyEmployeeSchema.js'
import getArrayPhotos        from '../../utility/getArrayPhotos.js'
import getSinglePhoto        from '../../utility/getSinglePhoto.js'


export default async (req: Request, res: Response) => {
  try {
    const { name, id, page, limit } = req.query

    if (id) {
      const employee = await CompanyEmployeeSchema.findById({ _id: id })

      getSinglePhoto(employee)

      return res.status(200).json(employee)
    } else {
      const { parsedLimit, skip } = getPagination(page, limit)

      let employees

      if (!name) {
        employees = await CompanyEmployeeSchema.find().limit(parsedLimit).skip(skip)
      } else {
        employees = await CompanyEmployeeSchema.find({ name }).limit(parsedLimit).skip(skip)
      }

      getArrayPhotos(employees)

      return res.status(200).json(employees)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
