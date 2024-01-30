import {
  Request,
  Response,
}                            from 'express'

import { getPagination }     from '../../helpers.js'
import { isNonExistant }     from '../../typeChecks.js'
import CompanyEmployeeSchema from '../../shemas/CompanyEmployeeSchema.js'
import getArrayPhotos        from '../../utility/getArrayPhotos.js'
import getSearchFilters      from '../../utility/getSearchFilters.js'
import getSinglePhoto        from '../../utility/getSinglePhoto.js'


export default async (req: Request, res: Response) => {
  try {
    const {
      companyId,
      email,
      id,
      isDisabled,
      lastname,
      limit,
      name,
      occupation,
      page,
      phone,
    } = req.query

    if (id) {
      const employee = await CompanyEmployeeSchema.findById({ _id: id })

      getSinglePhoto(employee)

      return res.status(200).json(employee)
    } else {
      const { parsedLimit, skip } = getPagination(page, limit)

      const params = getSearchFilters({
        name,
        email,
        lastname,
        occupation,
        phone,
      })

      if (!isNonExistant(isDisabled)) {
        params.isDisabled = isDisabled
      }

      if (!isNonExistant(companyId)) {
        params.comanyId = companyId
      }

      const employees = await CompanyEmployeeSchema.find(params).limit(parsedLimit).skip(skip)

      getArrayPhotos(employees)

      return res.status(200).json(employees)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
