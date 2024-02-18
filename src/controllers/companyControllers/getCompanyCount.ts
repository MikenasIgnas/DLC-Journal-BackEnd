import {
  Request,
  Response,
}                         from 'express'

import CompanySchema      from '../../shemas/CompanySchema'


export default async (req: Request, res: Response) => {
  try {
    const companies = await CompanySchema.count()

    return res.status(200).json(companies)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
