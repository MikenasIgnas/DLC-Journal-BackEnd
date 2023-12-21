import { Response }                     from 'express';
import { TypedRequestBody, VisitsType } from '../types';
import { jsPDF }                        from 'jspdf';
import autoTable                        from 'jspdf-autotable';

const MongoClient = require('mongodb').MongoClient;
const client      = new MongoClient('mongodb://10.81.7.29:27017/');
const fs          = require('fs');
interface ChangePasswordBody {
  id:             string;
  oldPassword:    string;
  password:       string;
  repeatPassword: string;
}

export default async (req: TypedRequestBody<ChangePasswordBody>, res: Response) => {
  try {
    const visits            = client.db('ChecklistDB').collection('visits');
    const visitId           = req.query.visitId;
    const visit: VisitsType = await visits.findOne({ id: Number(visitId) })
    const backgroundPath    = 'src/Images/PDFbackround.png';
    const backgroundBuffer  = fs.readFileSync(backgroundPath);
    
    if (!visit) {
      res.status(500).json({ message: 'Could not find visit by that id' });
    } else {
      const doc = new jsPDF({ putOnlyUsedFonts: true, orientation: 'landscape' });
      doc.addFont("src/Fonts/arial.ttf", "Arial", "bold");
      doc.setFont("Arial", "bold"); 
      doc.setFontSize(20);
      doc.addImage(backgroundBuffer, 'PNG', 0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height);
      
      const originalFontSize = doc.getFontSize();

      doc.setFontSize(14);
      doc.text("Vizito ataskaita", doc.internal.pageSize.width / 2, 30, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Data: ${visit.creationDate}`, doc.internal.pageSize.width / 2, 35, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Duomenų centras: ${visit.visitAddress}`, doc.internal.pageSize.width / 2, 40, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Įmonė: ${visit.visitingClient}`, doc.internal.pageSize.width / 2, 45, { align: 'center' });
      
      doc.setFontSize(originalFontSize);

      autoTable(doc,{
        head: [
          ['Vardas', 'Pavardė', 'Gimimo data', 'Pareigos', 'Telefono Nr.', 'El.Paštas', 'Dokumentas' ,'Leidimai', 'Parašas'],
        ],
        bodyStyles: {
          minCellHeight: 20,
        },
        body: visit?.visitors?.map((el: any) => [
          el?.selectedVisitor?.name,
            el?.selectedVisitor?.lastName,
            el?.selectedVisitor?.birthday,
            el?.selectedVisitor?.occupation,
            el?.selectedVisitor?.phoneNr,
            el?.selectedVisitor?.email,
            el.idType,
            el.selectedVisitor.permissions.map((el: string) => `${el}\n`),
            el.signature,
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
              const { raw, x, y } = data.cell;
              
              if (typeof raw === 'string') {
                doc.addImage(raw, 'PNG', x , y, 15, 15)
              }
            }
          },
          styles: {font: 'Arial'},
          startY: 50,
        });
        
        const docOutput = doc.output('arraybuffer');
        const docBuffer = Buffer.from(docOutput as any, 'ascii');
        
        res.setHeader('Content-Disposition', 'attachment; filename="two-by-four.pdf"');
        res.setHeader('Content-Type', 'application/pdf');
        res.send(docBuffer);
      }
    } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Unexpected error' });
  }
};