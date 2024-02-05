import { Response }          from 'express'
import { ObjectId }          from 'mongoose'

import { TypedRequestBody }  from '../../types.js'
import VisitorSchema         from '../../shemas/VisitorSchema.js'
import VisitSchema           from '../../shemas/VisitSchema.js'

interface Body {
  id: ObjectId
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { id } = req.body

    if (!id) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    await VisitSchema.findByIdAndDelete(id)

    const visitors = await VisitorSchema.find({ visitId: id })

    for (let index = 0; index < visitors.length; index++) {
      await VisitorSchema.findByIdAndDelete(visitors[index]._id)
    }

    return res.status(200).json({ message: 'Delete success' })
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
