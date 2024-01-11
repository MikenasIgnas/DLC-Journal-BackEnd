import {
  Response,
  Request
}                           from 'express';

import UserSchema           from '../../shemas/UserSchema.js';

import getUserFilterParams  from './getUserFilterParams.js';


export default async (req: Request, res: Response) => {
  try {
    const params = getUserFilterParams(req.query)

    const count = await UserSchema.find(params).countDocuments()

    return res.status(200).json(count)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
