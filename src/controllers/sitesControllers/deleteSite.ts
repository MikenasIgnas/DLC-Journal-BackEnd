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

    await SiteSchema.findByIdAndDelete({ _id: id })

    const premises = await PremiseSchema.find({ siteId: id })

    for (let index = 0; index < premises.length; index++) {
      const premise = premises[index]

      const racks = await RackSchema.find({ premiseId: premise.id })

      await premise.delete()
      await premise.save()

      for (let index = 0; index < racks.length; index++) {
        const rack = racks[index]

        await rack.delete()

        await rack.save()
      }
    }

    return res.status(200).json({ message: 'Delete success' })
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
