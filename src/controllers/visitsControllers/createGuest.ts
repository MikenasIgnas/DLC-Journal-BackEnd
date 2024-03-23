import { Response }         from 'express'
import { ObjectId }         from 'mongoose'

import { TypedRequestBody } from '../../types.js'
import GuestSchema          from '../../shemas/GuestSchema.js'

interface Body {
  company:      string
  name:         string
  visitId:      ObjectId
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { name, company, visitId } = req.body

    if (!visitId) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    const instance = new GuestSchema({
      company,
      name,
      visitId,
    })

    await instance.save()

    return res.status(201).json(instance)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
