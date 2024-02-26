import { Response }         from 'express'
import { ObjectId }         from 'mongoose'

import { TypedRequestBody } from '../../types.js'
import SiteSchema           from '../../shemas/SiteSchema.js'

interface EditCompanyBody {
  id:         ObjectId
  name?:      string
  isRemote?:  boolean
}


export default async (req: TypedRequestBody<EditCompanyBody>, res: Response) => {
  try {
    const { id, name, isRemote } = req.body

    if (!id) {
      return res.status(400).json({ message: 'Bad request' })
    }

    const site = await SiteSchema.findByIdAndUpdate(
      { _id: id },
      { name, isRemote },
      { new: true }
    )

    return res.status(201).json(site)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
