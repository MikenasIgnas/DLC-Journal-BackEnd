import {
  Response,
  Request,
}                                     from 'express'


import CompanyEmployeeSchema          from '../../shemas/CompanyEmployeeSchema.js'
import getCompanyEmployeeFilterParams from './getCompanyEmployeeFilterParams.js'


export default async (req: Request, res: Response) => {
  try {
    const params = getCompanyEmployeeFilterParams(req.query)

    const count = await CompanyEmployeeSchema.find(params).countDocuments()

    return res.status(200).json(count)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
