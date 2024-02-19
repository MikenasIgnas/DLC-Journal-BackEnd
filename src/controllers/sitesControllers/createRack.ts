import { Response }         from 'express'
import { ObjectId }         from 'mongoose'

import { TypedRequestBody } from '../../types.js'
import RackSchema           from '../../shemas/RackSchema.js'

interface Body {
  name:      string
  premiseId: ObjectId
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { name, premiseId } = req.body

    if (!(name && premiseId)) {
      return res.status(400).json({ message: 'Bad request' })
    }

    const exists = await RackSchema.exists({ name })

    if (exists) {
      return res.status(409).json({ message: 'Rack Already Exist.' })
    } else {
      const instance = new RackSchema({
        name,
        premiseId,
      })

      await instance.save()

      return res.status(201).json(instance)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
