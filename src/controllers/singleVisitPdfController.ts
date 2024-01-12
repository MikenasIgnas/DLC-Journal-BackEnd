/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { MongoClient }       from 'mongodb'
import {  VisitsType }       from '../types'
import jsPDF                 from 'jspdf'
import autoTable             from 'jspdf-autotable'
import fs                    from 'fs'

const client = new MongoClient(process.env.MONGO_PATH)
interface ExtendedJsPDF extends jsPDF {
  lastAutoTable?: {
      finalY?: number;
  };
}

export default async (req: Request, res: Response) => {
  try {
    const visits           = client.db('ChecklistDB').collection<VisitsType>('visits')
    const visitId          = req.query.visitId
    const visit            = await visits.findOne({ id: Number(visitId) })
    const backgroundPath   = 'src/Images/PDFbackround.png'
    const backgroundBuffer = fs.readFileSync(backgroundPath)

    if (!visit) {
      res.status(500).json({ message: 'Could not find visit by that id' })
    } else {
      const doc: ExtendedJsPDF = new jsPDF({ putOnlyUsedFonts: true, orientation: 'landscape' })
      doc.addFont('src/Fonts/arial.ttf', 'Arial', 'bold')
      doc.setFont('Arial', 'bold')
      doc.setFontSize(20)
      doc.addImage(
        backgroundBuffer,
        'PNG',
        0,
        0,
        doc.internal.pageSize.width + 50,
        doc.internal.pageSize.height
      )

      const originalFontSize = doc.getFontSize()

      doc.setFontSize(14)
      doc.text('Vizito ataskaita', doc.internal.pageSize.width / 2, 30, { align: 'center' })

      doc.setFontSize(10)
      doc.text(
        `Data: ${visit.creationDate}`,
        doc.internal.pageSize.width / 2,
        35,
        { align: 'center' }
      )

      doc.setFontSize(10)
      doc.text(
        `Duomenų centras: ${visit.visitAddress}`,
        doc.internal.pageSize.width / 2,
        40,
        { align: 'center' }
      )

      doc.setFontSize(10)
      doc.text(
        `Įmonė: ${visit.visitingClient}`,
        doc.internal.pageSize.width / 2,
        45,
        { align: 'center' }
      )

      doc.setFontSize(originalFontSize)

      autoTable(doc,{
        head: [
          [
            'Vardas',
            'Pavardė',
            'Gimimo data',
            'Pareigos',
            'Telefono Nr.',
            'El.Paštas',
            'Dokumentas',
            'Leidimai',
            'Parašas',
          ],
        ],
        bodyStyles: {
          minCellHeight: 20,
        },
        body: visit?.visitors?.map((el) => [
          el?.selectedVisitor?.name || '',
          el?.selectedVisitor?.lastName || '',
          el?.selectedVisitor?.birthday || '',
          el?.selectedVisitor?.occupation || '',
          el?.selectedVisitor?.phoneNr || '',
          el?.selectedVisitor?.email || '',
          el.idType || '',
          el?.selectedVisitor?.permissions?.map((el: string) => `${el}\n`).join('') || '',
          el?.signature || null,
        ]),
        columns: [
          { header: 'Vardas', dataKey: 'name' },
          { header: 'Pavardė', dataKey: 'lastName' },
          { header: 'Gimimo data', dataKey: 'birthday' },
          { header: 'Pareigos', dataKey: 'occupation' },
          { header: 'Telefono Nr.', dataKey: 'phoneNr' },
          { header: 'El.Paštas', dataKey: 'email' },
          { header: 'Dokumentas', dataKey: 'idType' },
          { header: 'Leidimai', dataKey: 'permissions' },
          { header: 'Parašas', dataKey: 'signature' },
        ],
        didParseCell: (data) => {
          if (data.row.section === 'body' && data.column.dataKey === 'signature') {
            data.cell.text = ['']
            data.cell.minWidth = 200
          }
        },
        didDrawCell: (data) => {
          if (data.row.section === 'body' && data.column.dataKey === 'signature') {
            const { raw, x, y } = data.cell

            if (typeof raw === 'string') {
              doc.addImage(raw, 'PNG', x , y, 15, 15)
            }
          }
        },
        styles: {font: 'Arial'},
        startY: 50,
      })
      if (visit?.visitCollocation && Object.keys(visit?.visitCollocation).length !== 0) {
        const firstTableEnd = doc?.lastAutoTable?.finalY
        if(firstTableEnd){
          doc.setFontSize(10)
          doc.text('Kolokacijos', 15, firstTableEnd + 10)
          doc.setFontSize(originalFontSize)

          autoTable(doc, {
            head: [
              ['Patalpa', 'Spinta'],
            ],
            columns: [
              { header: 'Patalpa', dataKey: 'premise' },
              { header: 'Spinta', dataKey: 'rack' },
            ],
            body:         Object.entries(visit?.visitCollocation).map(([key, value]) => [key, value]),
            startY:       firstTableEnd + 15,
            styles:       {font: 'Arial'},
            columnStyles: { premise: {cellWidth: 50}},
          })
        }
      }
      if(visit.clientsGuests && visit.clientsGuests.length > 0){
        const secondTableEnd = doc?.lastAutoTable?.finalY
        if(secondTableEnd){
          doc.setFontSize(10)
          doc.text('Palyda', 15, secondTableEnd + 10)
          doc.setFontSize(originalFontSize)
          autoTable(doc, {
            head: [
              ['Varads/Pavardė', 'Įmonė'],
            ],
            body: visit.clientsGuests.map((el) => [
              el.guestName,
              el.companyName,
            ]),
            columns: [
              { header: 'Vardas/Pavardė', dataKey: 'name' },
              { header: 'Įmonė', dataKey: 'company' },
            ],
            startY: secondTableEnd + 15,
            styles: {font: 'Arial'},
          })
        }
      }
      const docOutput = doc.output('arraybuffer')
      const docBuffer = Buffer.from(docOutput)
      res.setHeader('Content-Disposition', 'attachment; filename="two-by-four.pdf"')
      res.setHeader('Content-Type', 'application/pdf')
      res.send(docBuffer)
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Unexpected error' })
  }
}