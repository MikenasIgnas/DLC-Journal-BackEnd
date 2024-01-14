import { Response }          from 'express'
import { ObjectId }          from 'mongoose'

import { TypedRequestBody }  from '../../types.js'
import CompanyEmployeeSchema from '../../shemas/CompanyEmployeeSchema.js'
import CompanySchema         from '../../shemas/CompanySchema.js'
import PermissionSchema      from '../../shemas/PermissionSchema.js'

interface EditCompanyEmployeeBody {
  birthday:    Date
  companyId:   ObjectId
  email:       string
  id:          ObjectId
  isDisabled?: boolean
  lastname:    string
  name:        string
  occupation:  string
  permissions: ObjectId[],
  phone:       string
  photo:       string
}


export default async (req: TypedRequestBody<EditCompanyEmployeeBody>, res: Response) => {
  try {
    const {
      birthday,
      companyId,
      email,
      id,
      isDisabled,
      lastname,
      name,
      occupation,
      permissions,
      phone,
      photo,
    } = req.body

    if (!(
      birthday &&
      name &&
      companyId &&
      id &&
      email &&
      lastname &&
      occupation &&
      permissions &&
      phone &&
      photo
    )) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    const companyExists = await CompanySchema.exists({ _id: companyId })

    if (!companyExists) {
      return res.status(400).json({ messsage: 'Company does not exist' })
    }

    for (let index = 0; index < permissions.length; index++) {
      const element = permissions[index]

      const exists = await PermissionSchema.exists({ _id: element })

      if (!exists) {
        return res.status(400).json({ messsage: 'Permission does not exist' })
      }
    }

    const instance = await CompanyEmployeeSchema.findByIdAndUpdate(
      { _id: id },
      {
        birthday,
        companyId,
        email,
        isDisabled,
        lastname,
        name,
        occupation,
        permissions,
        phone,
        photo,
      },
      { new: true }
    )

    return res.status(201).json(instance)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
