import { Response }         from 'express';
import { TypedRequestBody, VisitsType } from '../types';
import { jsPDF }            from 'jspdf';
import autoTable            from 'jspdf-autotable';

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient('mongodb://10.81.7.29:27017/');
interface ChangePasswordBody {
  id: string;
  oldPassword: string;
  password: string;
  repeatPassword: string;
}

export default async (req: TypedRequestBody<ChangePasswordBody>, res: Response) => {
  try {
    const visits = client.db('ChecklistDB').collection('visits');
    const visitId = req.query.visitId;
    const visit: VisitsType = await visits.findOne({ id: Number(visitId) })

    if (!visit) {
      res.status(500).json({ message: 'Could not find visit by that id' });
    } else {
      const doc = new jsPDF({ putOnlyUsedFonts: true, orientation: 'landscape' });
      doc.addFont("src/Fonts/arial.ttf", "Arial", "bold");
      doc.setFont("Arial", "bold"); 
      doc.setFontSize(20);
      autoTable(doc,{
          head: [
            ['Vardas', 'Pavardė', 'Gimimo data', 'Pareigos', 'Telefono Nr.', 'El.Paštas', 'Parašas'],
          ],
          body: visit?.visitors?.map((el: any) => [
            el?.selectedVisitor?.name,
            el?.selectedVisitor?.lastName,
            el?.selectedVisitor?.birthday,
            el?.selectedVisitor?.occupation,
            el?.selectedVisitor?.phoneNr,
            el?.selectedVisitor?.email,
          ]), 
          columns: [
            { header: 'Vardas', dataKey: 'name' },
            { header: 'Pavardė', dataKey: 'lastName' },
            { header: 'Gimimo data', dataKey: 'birthday' },
            { header: 'Pareigos', dataKey: 'occupation' },
            { header: 'Telefono Nr.', dataKey: 'phoneNr' },
            { header: 'El.Paštas', dataKey: 'email' },
            { header: 'Parašas', dataKey: 'signature' },
          ],
          didDrawCell: (data) => {
            if (data.column.dataKey === 'signature') {
              const { x, y } = data.cell;
               visit.visitors.map((el) =>{
                if(el.signature){
                  doc.addImage(el.signature, 'PNG', x + 2, y + 2, 15, 15)
                }
              })
            }
          },
          styles: {font: 'Arial'}
        });
      doc.save('table.pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="two-by-four.pdf"');
      res.setHeader('Content-Type', 'application/pdf');
      res.send(doc.output());
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Unexpected error' });
  }
};