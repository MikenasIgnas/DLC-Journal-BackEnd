import { Response }          from 'express'
import { ObjectId }          from 'mongoose'

import { TypedRequestBody }  from '../../types.js'
import visitStatusSchema     from '../../shemas/visitStatusSchema.js'

interface Body {
  id: ObjectId
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { id } = req.body

    if (!id) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    await visitStatusSchema.findByIdAndDelete(id)

    return res.status(200).json({ message: 'Delete success' })
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
