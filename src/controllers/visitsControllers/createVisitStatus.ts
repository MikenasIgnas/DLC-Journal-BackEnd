import { Response }         from 'express'

import { TypedRequestBody } from '../../types.js'
import visitStatusSchema    from '../../shemas/visitStatusSchema.js'

interface Body {
  name: string
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    const exists = await visitStatusSchema.exists({ name })

    if (exists) {
      return res.status(409).json({ message: 'Visit status Already Exist.' })
    } else {
      const instance = new visitStatusSchema({
        name,
      })

      await instance.save()

      return res.status(201).json(instance)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
