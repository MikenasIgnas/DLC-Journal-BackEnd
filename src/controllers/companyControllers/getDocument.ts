import {
  Request,
  Response,
}                        from 'express'

export default async (req: Request, res: Response) => {
  const { fileName } = req.query
  try {

    if (typeof fileName === 'string') {
      res.download(fileName)
    }

  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}