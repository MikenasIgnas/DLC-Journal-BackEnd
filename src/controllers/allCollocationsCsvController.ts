import {
  Request,
  Response,
}           from 'express'
import Papa from 'papaparse'

export default async (req: Request, res: Response) => {
  try {
    const csv = Papa.unparse(req.body, { header: true, skipEmptyLines: false })
    res.status(200).send(csv)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}