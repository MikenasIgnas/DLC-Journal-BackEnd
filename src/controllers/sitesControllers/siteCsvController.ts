import {
  Request,
  Response,
}                     from 'express'

import ExcelJS        from 'exceljs'
import CompanySchema  from '../../shemas/CompanySchema'
import PremiseSchema  from '../../shemas/PremiseSchema'
import RackSchema     from '../../shemas/RackSchema'
import SiteSchema     from '../../shemas/SiteSchema'

export default async (req: Request, res: Response) => {
  const { siteId } = req.body

  try {
    const site = await SiteSchema.findById(siteId)

    if (!site) {
      return res.status(404).json({ message: 'Site not found' })
    }

    const premises = await PremiseSchema.find({ siteId: site._id })
    const workbook = new ExcelJS.Workbook()

    for (const premise of premises) {
      const racks     = await RackSchema.find({ premiseId: premise._id })
      const racksIds  = racks.map(rack => rack._id)
      const companies = await CompanySchema.find({ racks: { $in: racksIds } })
      const sheet     = workbook.addWorksheet(premise.name)

      sheet.addRow([premise.name, 'Spinta', 'Įmonė'])

      racks.forEach(rack => {
        const companyNames = companies
          .filter(company => company.racks.some(companyRack =>
            companyRack.toString() === rack._id.toString()))
          .map(company => company.name)
          .join(', ')

        sheet.addRow([' ', rack.name, companyNames])
      })
    }

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=site-premise-racks.csv')

    await workbook.xlsx.write(res)
    res.status(200).end()
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}