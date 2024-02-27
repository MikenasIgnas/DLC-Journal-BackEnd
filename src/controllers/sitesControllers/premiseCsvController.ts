import {
  Request,
  Response,
}                             from 'express'
import CompanySchema          from '../../shemas/CompanySchema'
import PremiseSchema          from '../../shemas/PremiseSchema'
import RackSchema             from '../../shemas/RackSchema'

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

    const racksIds  = racks.map((rack) => rack._id)
    const companies = await CompanySchema.find({ racks: { $in: racksIds } })
    const csvData   = [[premise.name, 'Spinta', 'Klientas']]

    racks.forEach(rack => {
      const companyNames = companies
        .filter(company => company.racks.some(companyRack =>
          companyRack.toString() === rack._id.toString()))
        .map(company => company.name)
        .join(', ')

      csvData.push([' ', rack.name, companyNames])
    })

    const csvString = csvData.map(row => row).join('\n')
    const BOM         = '\uFEFF'
    const csvContent  = BOM + csvString
    const csvBuffer   = Buffer.from(csvContent, 'utf-8')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename=${premise.name}-racks.csv`)
    res.status(200).send(csvBuffer)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}