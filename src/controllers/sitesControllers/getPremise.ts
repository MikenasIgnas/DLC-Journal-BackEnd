import {
  Request,
  Response,
}                        from 'express'

import { getPagination } from '../../helpers.js'
import { isNonExistant } from '../../typeChecks.js'
import getSearchFilters  from '../../utility/getSearchFilters.js'
import PremiseSchema     from '../../shemas/PremiseSchema.js'


export default async (req: Request, res: Response) => {
  try {
    const { name, id, page, limit, siteId } = req.query

    if (id) {
      const premise = await PremiseSchema.findById({ _id: id })

      return res.status(200).json(premise)
    } else {
      const { parsedLimit, skip } = getPagination(page, limit)

      const params = getSearchFilters({ name })

      if (!isNonExistant(siteId)) {
        params.siteId = siteId
      }

      const premises = await PremiseSchema.find(params).limit(parsedLimit).skip(skip)

      return res.status(200).json(premises)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
