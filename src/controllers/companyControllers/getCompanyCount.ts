import CompanySchema from '../../shemas/CompanySchema'

import {
  Request,
  Response,
}                        from 'express'

export default async (req: Request, res: Response) => {
  try {
    const visits = await CompanySchema.find()

    return res.status(200).json(visits.length)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
