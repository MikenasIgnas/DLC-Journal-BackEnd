import {
  Request,
  Response,
}                            from 'express'

import CompanyDocumentSchema from '../../shemas/CompanyDocumentSchema'


export default async (req: Request, res: Response) => {
  const { companyId } = req.query

  try {
    const companyDocuments = await CompanyDocumentSchema.find({companyId})

    return res.status(200).json(companyDocuments)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
