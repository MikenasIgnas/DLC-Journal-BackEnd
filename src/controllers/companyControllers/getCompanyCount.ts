import {
  Request,
  Response,
}                     from 'express'

import CompanySchema  from '../../shemas/CompanySchema'


export default async (req: Request, res: Response) => {
  const { name } = req.query
  try {
    if (!name) {
      const companies = await CompanySchema.count()

      return res.status(200).json(companies)
    } else {
      const searchRegex = new RegExp(name as string, 'i')

      const companies = await CompanySchema.find({ name: { $regex: searchRegex } }).count()

      return res.status(200).json(companies)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}