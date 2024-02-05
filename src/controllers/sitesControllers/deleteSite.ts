import { Response }          from 'express'
import { ObjectId }          from 'mongoose'

import { TypedRequestBody }  from '../../types.js'
import PremiseSchema         from '../../shemas/PremiseSchema.js'
import RackSchema            from '../../shemas/RackSchema.js'
import SiteSchema            from '../../shemas/SiteSchema.js'

interface Body {
  id: ObjectId
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { id } = req.body

    if (!id) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    await SiteSchema.findByIdAndDelete(id)

    const premises = await PremiseSchema.find({ siteId: id })

    for (let index = 0; index < premises.length; index++) {
      const premiseId = premises[index]._id

      const racks = await RackSchema.find({ premiseId })

      await PremiseSchema.findByIdAndDelete(premiseId)

      for (let index = 0; index < racks.length; index++) {
        await RackSchema.findByIdAndDelete(racks[index]._id)
      }
    }

    return res.status(200).json({ message: 'Delete success' })
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
