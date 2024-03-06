import bcrypt               from 'bcrypt'
import { Response }         from 'express'

import { getUserId }        from '../../helpers.js'
import { TypedRequestBody } from '../../types.js'
import UserSchema           from '../../shemas/UserSchema.js'

interface Body {
    password:       string
    repeatPassword: string
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { password, repeatPassword } = req.body

    const id = await getUserId(req)

    if (!password || !repeatPassword) {
      return res.status(500).json({ message: 'Visi laukai privalomi' })
    }

    if (repeatPassword !== password) {
      return res.status(500).json({ message: 'Slaptažodžiai nesutampa' })
    }

    const user = await UserSchema.findById({ _id: id })

    if (!user) {
      return res.status(500).json({ message: 'Nerastas vartotojas' })
    } else {

      const encryptedPassword = await bcrypt.hash(password, 10)

      await user.updateOne({
        password: encryptedPassword,
      })

      await user.save()

      return res.status(201).json({ message: 'Slaptažodis pakeistas' })
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
