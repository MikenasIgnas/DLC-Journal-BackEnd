import {
  Request,
  Response,
}                        from 'express'

import { getPagination } from '../../helpers.js'
import { NameAndId }     from '../../types.js'
import getSearchFilters  from '../../utility/getSearchFilters.js'
import PremiseSchema     from '../../shemas/PremiseSchema.js'
import RackSchema        from '../../shemas/RackSchema.js'
import SiteSchema        from '../../shemas/SiteSchema.js'

interface PremiseWithRacks extends NameAndId {
  racks?: NameAndId[]
}

interface SiteWithPremises extends NameAndId {
  premises?: PremiseWithRacks[]
}


export default async (req: Request, res: Response) => {
  try {
    const { name, id, page, limit } = req.query

    if (id) {
      const site = await SiteSchema.findById({ _id: id })

      return res.status(200).json(site)
    } else {
      const { parsedLimit, skip } = getPagination(page, limit)

      const params = getSearchFilters({ name })

      const fullSiteData: SiteWithPremises[] = []

      const sites = await SiteSchema.find(params).limit(parsedLimit).skip(skip)

      for (let index = 0; index < sites.length; index++) {
        const element: SiteWithPremises = sites[index]

        const fullSite: SiteWithPremises = { name: element.name, _id: element._id, premises: [] }

        const premises = await PremiseSchema.find({ siteId: element._id })

        element.premises = [...premises]

        for (let index = 0; index < premises.length; index++) {
          const element = premises[index]

          const racks = await RackSchema.find({ premiseId: element._id })

          if (fullSite.premises) {
            fullSite.premises.push({ name: element.name, _id: element._id, racks })
          }
        }

        fullSiteData.push(fullSite)
      }

      return res.status(200).json(fullSiteData)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
