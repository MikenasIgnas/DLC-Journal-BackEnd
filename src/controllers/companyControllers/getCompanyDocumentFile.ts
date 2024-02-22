import {
  Request,
  Response,
}                            from 'express'

import CompanyDocumentSchema from '../../shemas/CompanyDocumentSchema'


export default async (req: Request, res: Response) => {
  const { id } = req.query

  try {
    const document = await CompanyDocumentSchema.findById(id)

    if (document) {
      res.download(document.path)
    } else {
      return res.status(404).json({ message: 'Document file not found' })
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
