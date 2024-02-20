import {
  Request,
  Response,
}                     from 'express'

import PremiseSchema  from '../../shemas/PremiseSchema'
import RackSchema     from '../../shemas/RackSchema'


export default async (req: Request, res: Response) => {
  const { premiseId } = req.body

  try {
    const premise = await PremiseSchema.findById(premiseId)

    if (!premise) {
      return res.status(404).json({ message: 'Premise not found' })
    }

    const racks = await RackSchema.find({ premiseId: premise._id })

    if (!racks.length) {
      return res.status(404).json({ message: 'No racks found for the specified premise' })
    }

    const csvData: string[][] = [[premise.name]]

    racks.forEach(rack => {
      csvData.push([rack.name])
    })

    const csvString = csvData.map(row => row.join(',')).join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename=${premise.name}-racks.csv`)

    res.status(200).send(csvString)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}