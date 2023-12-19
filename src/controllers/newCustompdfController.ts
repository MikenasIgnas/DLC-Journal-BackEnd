import { Response } from 'express';
import fs       from 'fs/promises';

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient('mongodb://10.81.7.29:27017/');

export default async (req: any, res: Response) => {
  try {
    const PDFDocument     = require("pdfkit-table");
    const dateFrom        = req.query.dateFrom;
    const dateTo          = req.query.dateTo;
    const visitCollection = client.db('ChecklistDB').collection('visits');
    const visits          = await visitCollection.find().toArray();
    const startDate       = new Date(dateFrom);
    const endDate         = new Date(dateTo);
    
    const visitsByDate = visits
      .filter((item: any) => {
        const visitDate = new Date(item.startDate);
        return visitDate >= startDate && visitDate <= endDate;
      })
      .sort((a: any, b: any) => b.id - a.id);
      
    if (!visitsByDate || visitsByDate.length === 0) {
      res.status(500).json({ message: 'No visits found within the specified date range' });
      return;
    } else {
      res.setHeader('Content-Type', 'application/pdf; charset=utf-8');
      const logoPath = 'src/Images/signatureLogo.png';
      const fontPath = 'src/Fonts/arial.ttf';
      const fontData = await fs.readFile(fontPath);

      let doc = new PDFDocument({ margin: 20, size: 'A4', layout: 'landscape' });
        visitsByDate?.map((visit: any, index: number) => {
          if (index > 0) {
            doc.addPage();
          }

          doc.image(logoPath, { width: 70, height: 50 });

          const table = {
            title: 'Duomenų Logistikos Centras',
            subtitle: `Vizito ataskaita ${visit.startDate}`,
            headers: [
              { label: 'Vardas', property: 'name', width: 60 },
              { label: 'Pavardė', property: 'lastName', width: 80 },
              { label: 'Pareigos', property: 'occupation', width: 70 },
              { label: 'Tel. Nr.', property: 'phoneNr', width: 70 },
              { label: 'El. paštas', property: 'email', width: 80 },
              { label: 'Gimimo data', property: 'birthday', width: 80 },
              { label: 'Dokumentas', property: 'idType', width: 80 },
              { label: 'Leidimai', property: 'permissions', width: 43 },
            ],
            rows: visit.visitors.map((el: any) => [
              el.selectedVisitor.name,
              el.selectedVisitor.lastName,
              el.selectedVisitor.occupation,
              el.selectedVisitor.phoneNr,
              el.selectedVisitor.email,
              el.selectedVisitor.birthday,
              el.idType,
              el.selectedVisitor.permissions,
            ]),
            options: {
              minRowHeight: 50,
            },
          };

          doc.table(table, {
            prepareHeader: () => doc.font(fontData).fontSize(8),
            prepareRow: (row: any, indexColumn: any, indexRow: any, rectRow: any) => {
              doc.font(fontData).fontSize(8);
              indexColumn === 0 && doc.addBackground(rectRow, 'white', 0.15);
            },
          });
        })

      doc.pipe(res);
      doc.end();
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Unexpected error' });
  }
};