import Papa         from 'papaparse';
import { Response } from 'express';

export default async (req: any, res: Response) => {
    try {
      const csv = Papa.unparse(req.body, { header: true, skipEmptyLines: false });
      res.status(200).send(csv);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };