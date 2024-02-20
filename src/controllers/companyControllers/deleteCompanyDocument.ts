import { Response }          from 'express'
import { ObjectId }          from 'mongoose'
import { unlink }            from 'fs'

import { TypedRequestBody }  from '../../types.js'
import CompanyDocumentSchema from '../../shemas/CompanyDocumentSchema.js'

interface Body {
  id:   ObjectId
}

export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { id } = req.body

    if (!id) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    const document = await CompanyDocumentSchema.findById(id)

    if (!document) {
      return res.status(400).json({ messsage: 'Document not found' })
    }

    unlink(document.path, (err) => {
      if (err) {
        return res.status(400).json({ messsage: 'Error deleting document file' })
      }
    })

    await CompanyDocumentSchema.findByIdAndDelete(id)

    return res.status(200).json({ message: 'File deleted successfully' })
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error occurred' })
  }
}
