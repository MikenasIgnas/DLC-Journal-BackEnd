import {
  Request,
  Response,
}           from 'express'
import SiteSchema from '../shemas/SiteSchema'
import PremiseSchema from '../shemas/PremiseSchema'
import RackSchema from '../shemas/RackSchema'


export default async (req: Request, res: Response) => {
  const { siteId } = req.body
  try {
    const site = await SiteSchema.findById(siteId)

    if (!site) {
      return res.status(404).json({ message: 'Site not found' })
    }

    const premises = await PremiseSchema.find({ siteId: site._id })
    let csvData: string[][] = []

    for (const premise of premises) {
      const racks = await RackSchema.find({ premiseId: premise._id })
      const rackNames = racks.map(rack => rack.name)
      csvData.push([premise.name, ...rackNames])
    }

    const maxRacks = Math.max(...csvData.map(column => column.length))

    csvData = csvData.map(column => {
      while (column.length < maxRacks) {
        column.push('')
      }
      return column
    })

    const siteNameRow = [site.name].concat(Array(maxRacks - 1).fill(''))
    csvData.unshift(siteNameRow)

    const csvRows = csvData[0].map((_, colIndex) => csvData.map(row => row[colIndex]))

    const csvString = csvRows.map(row => row.join(',')).join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=site-premise-racks.csv')

    res.status(200).send(csvString)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}