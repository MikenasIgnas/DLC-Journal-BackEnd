import { Response }          from 'express'
import { ObjectId }          from 'mongoose'

import { TypedRequestBody }  from '../../types.js'
import CompanyEmployeeSchema from '../../shemas/CompanyEmployeeSchema.js'
import PermissionSchema      from '../../shemas/PermissionSchema.js'


interface DeletePermissionBody {
  id: ObjectId
}


export default async (req: TypedRequestBody<DeletePermissionBody>, res: Response) => {
  try {
    const { id } = req.body

    if (!id) {
      return res.status(400).json({ message: 'Bad request' })
    }

    const employees = await CompanyEmployeeSchema.find({ permissions: id })

    for (let index = 0; index < employees.length; index++) {
      const element = employees[index]

      const newPermissions = element.permissions.filter(item => item === id)

      element.permissions = newPermissions

      await element.save()
    }

    await PermissionSchema.findByIdAndDelete({ _id: id })

    return res.status(201).json({ message: 'Delete success' })
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
