import {
  Request,
  Response,
}                            from 'express'
import { Types }             from 'mongoose'

import { getPagination }     from '../../helpers'
import CompanyDocumentSchema from '../../shemas/CompanyDocumentSchema'

interface Params {
  companyId?: Types.ObjectId
}


export default async (req: Request, res: Response) => {
  const { companyId, id, limit, page } = req.query

  try {
    if (id) {
      const document = await CompanyDocumentSchema.findById(id)

      return res.status(200).json(document)
    } else {
      const { parsedLimit, skip } = getPagination(page, limit)
      const params: Params = {}

      if (typeof companyId === 'string') {
        params.companyId = new Types.ObjectId(companyId)
      }

      const documents = await CompanyDocumentSchema.find(params).limit(parsedLimit).skip(skip)

      return res.status(200).json(documents)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
