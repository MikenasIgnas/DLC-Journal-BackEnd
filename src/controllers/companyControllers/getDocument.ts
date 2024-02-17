import {
  Request,
  Response,
}                        from 'express'

export default async (req: Request, res: Response) => {
  const { filepath } = req.query
  try {

    if (typeof filepath === 'string') {
      res.download(filepath)
    }

  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}