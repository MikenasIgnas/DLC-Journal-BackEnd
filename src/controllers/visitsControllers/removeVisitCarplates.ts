import { Response }          from 'express'
import {  Types }            from 'mongoose'

import { TypedRequestBody }  from '../../types.js'
import VisitSchema           from '../../shemas/VisitSchema.js'

interface Body {
  carPlate: string
  visitId:  Types.ObjectId
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const {
      carPlate,
      visitId,
    } = req.body

    if (!carPlate && !visitId) {
      return res.status(400).json({ message: 'Bad request' })
    }

    const instance = await VisitSchema.findByIdAndUpdate(
      { _id: visitId },
      { $pull: { carPlates: carPlate } },
      { new: true }
    )

    return res.status(201).json(instance)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
