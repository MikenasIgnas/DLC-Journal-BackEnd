import { Response }         from 'express'
import { TypedRequestBody } from '../types'
import VisitsSchema from '../shemas/VisitsSchema'

const PDFDocument = require('pdfkit');

// import fs from 'fs'


interface ChangePasswordBody {
  id:            string
  oldPassword:   string
  password:      string
  repeatPassword:string
}


export default async (req: TypedRequestBody<ChangePasswordBody>, res: Response) => {
  try {
    // kazkodel su id neranda, gal veiks kai duombaze bus sutvarkyta

    // const { id } = req.query

    const visit = await VisitsSchema.findOne({ clientsEmployees: 'Tomas_Bite' })
    // const visit = await VisitsSchema.findById({ _id: id })

    if (!visit) {
      res.status(500).json({ message: 'Could not find visit by that id' })
    } else {
    const doc = new PDFDocument();
      

      doc.text("Data Logistics center", 250, 10);
      doc.text(`Klientas: ${visit.clientsEmployees}`, 250, 50);

      res.setHeader('Content-type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=application.pdf');
      doc.pipe(res);
      doc.end();
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Unexpected error' })
  }
}
