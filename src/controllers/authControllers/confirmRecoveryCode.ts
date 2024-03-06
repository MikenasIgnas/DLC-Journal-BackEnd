import jwt                  from 'jsonwebtoken'
import { Response }         from 'express'

import { TypedRequestBody } from '../../types.js'

import { DecodedToken }     from './types.js'

interface Body {
    recoveryCode:  string
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { recoveryCode }  = req.body
    const token             = req.headers['token'] as string

    const decoded = jwt.verify(token, process.env.TOKEN_KEY) as DecodedToken

    if (!recoveryCode) {
      return res.status(400).json({ message: 'Bad request' })
    }

    if (decoded.recoveryCode?.toLowerCase() !== req.body.recoveryCode?.toLowerCase()) {
      return res.status(401).json({ message: 'Wrong code' })
    }


    res.status(200).json({ message: 'success' })
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}