import {
  Request,
  Response,
}                        from 'express'

import { getPagination } from '../../helpers.js'
import CompanySchema     from '../../shemas/CompanySchema.js'
import getArrayPhotos    from '../../utility/getArrayPhotos.js'
import getSearchFilters  from '../../utility/getSearchFilters.js'
import getSinglePhoto    from '../../utility/getSinglePhoto.js'


export default async (req: Request, res: Response) => {
  try {
    const { name, id, page, parentId, limit } = req.query

    if (id) {
      const company = await CompanySchema.findById(id)
      if (!company) {
        return res.status(404).json({ message: 'Company not found' })
      }

      try {
        const photo = await getSinglePhoto(company)
        company.photo = photo

      } catch (error) {
        company.photo = ''
      }

      return res.status(200).json(company)

    } else {
      const { parsedLimit, skip } = getPagination(page, limit)

      const params = getSearchFilters({ name })

      if (parentId) {
        params.parentId = parentId
      }

      let companies = await CompanySchema.find(params).limit(parsedLimit).skip(skip)

      companies = companies.map((el) => el.toObject())

      const companiesFull = await getArrayPhotos(companies)

      return res.status(200).json(companiesFull)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
