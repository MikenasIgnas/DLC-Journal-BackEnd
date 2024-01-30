import { Response }          from 'express'
import { ObjectId }          from 'mongoose'
import emailvalidator        from 'email-validator'

import { TypedRequestBody }  from '../../types.js'
import CompanyEmployeeSchema from '../../shemas/CompanyEmployeeSchema.js'
import CompanySchema         from '../../shemas/CompanySchema.js'
import PermissionSchema      from '../../shemas/PermissionSchema.js'


interface CreateCompanyEmployeeBody {
  birthday:    Date
  companyId:   ObjectId
  email:       string
  isDisabled?: boolean
  lastname:    string
  name:        string
  occupation:  string
  permissions: ObjectId[],
  phone:       string
  photo:       string
  note:        string
}


export default async (req: TypedRequestBody<CreateCompanyEmployeeBody>, res: Response) => {
  try {
    const {
      birthday,
      companyId,
      email,
      isDisabled,
      lastname,
      name,
      occupation,
      permissions,
      phone,
      note,
    } = req.body

    const photo = req.file?.path

    if (!(
      birthday &&
      name &&
      companyId &&
      email &&
      lastname &&
      occupation &&
      permissions &&
      phone
    )) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    const isEmailValid = emailvalidator.validate(email)

    if (!isEmailValid) {
      return res.status(400).json({ messsage: 'Invalid email' })
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

    const instance = new CompanyEmployeeSchema({
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
      note,
    })

    await instance.save()

    return res.status(201).json(instance)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
