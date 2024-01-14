import {
  Request,
  Response,
}                        from 'express'

import { getPagination } from '../../helpers.js'
import CompanySchema     from '../../shemas/CompanySchema.js'


export default async (req: Request, res: Response) => {
  try {
    const { name, id, page, limit } = req.query

    if (id) {
      const company = await CompanySchema.findById({ _id: id })

      return res.status(200).json(company)
    } else {
      const { parsedLimit, skip } = getPagination(page, limit)

      let companies

      if (!name) {
        companies = await CompanySchema.find().limit(parsedLimit).skip(skip)
      } else {
        companies = await CompanySchema.find({ name }).limit(parsedLimit).skip(skip)
      }

      return res.status(200).json(companies)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
