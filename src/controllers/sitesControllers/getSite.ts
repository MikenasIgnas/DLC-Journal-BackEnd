import {
  Request,
  Response,
}                        from 'express'

import { getPagination } from '../../helpers.js'
import getSearchFilters  from '../../utility/getSearchFilters.js'
import SiteSchema        from '../../shemas/SiteSchema.js'


export default async (req: Request, res: Response) => {
  try {
    const { name, id, page, limit } = req.query

    if (id) {
      const site = await SiteSchema.findById({ _id: id })

      return res.status(200).json(site)
    } else {
      const { parsedLimit, skip } = getPagination(page, limit)

      const params = getSearchFilters({ name })

      const sites = await SiteSchema.find(params).limit(parsedLimit).skip(skip)

      return res.status(200).json(sites)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
